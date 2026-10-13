import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  extractInactiveAccountForbiddenMessage,
  getFriendlyErrorMessage,
} from "./errors";
import { logger } from "./logger";
import { API_BASE_URL } from "./config";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    /** Set once a request has been replayed after a token refresh. */
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // CSRF defence: cross-site forms cannot set custom headers.
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15000,
});

// For FormData bodies, delete the default Content-Type so the browser sets
// multipart/form-data with the correct boundary automatically.
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Refresh-token retry state — shared across all concurrent requests.
let isRefreshing = false;
let failedQueue: {
  resolve: () => void;
  reject: (e: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

// Endpoints where a 401 must NOT trigger a refresh attempt (would loop, or the
// 401 is a credential error the caller handles itself). `/users/me` is
// deliberately NOT listed: an expired 15-min jwt cookie with a valid refresh
// cookie is recovered by one refresh + retry.
export const NO_REFRESH_PATHS = [
  "/users/refresh",
  "/users/login",
  "/users/signup",
  "/users/logout",
  "/users/forgotPassword",
  "/users/resetPassword",
  "/users/verifyEmail",
  "/users/verify",
  "/users/updateMyPassword",
];

// Response interceptor: normalise errors, attempt token refresh on 401.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const originalConfig = error.config as InternalAxiosRequestConfig;

    // Log only to our dev-only logger — production builds silence it.
    const isSessionProbe = url.includes("/users/me");
    const isSessionProbe401 = status === 401 && isSessionProbe;
    if (!isSessionProbe401) {
      logger.error("[api]", url, status);
    }

    if (status === 401) {
      // Wrong current password returns 401 — don't force logout on Profile.
      if (url.includes("/users/updateMyPassword")) {
        return Promise.reject(decorateError(error));
      }

      const skipRefresh = NO_REFRESH_PATHS.some((p) => url.includes(p));
      if (skipRefresh) {
        // A failed login/signup etc. is a credential error, not an expired
        // session: don't wipe storage or announce expiry. (A failed refresh
        // is handled by the single-flight catch block below.)
        return Promise.reject(decorateError(error));
      }

      // Already replayed once — give up cleanly (no loops).
      if (!originalConfig || originalConfig._retry) {
        // The /users/me session probe is handled by AuthContext (no redirect
        // away from public pages for guests with stale storage).
        if (!isSessionProbe) redirectToLogin();
        return Promise.reject(decorateError(error));
      }
      originalConfig._retry = true;

      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes.
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalConfig))
          .catch((e) => Promise.reject(decorateError(e as AxiosError)));
      }

      isRefreshing = true;

      try {
        await api.post("/users/refresh");
        processQueue(null);
        return api(originalConfig);
      } catch (refreshError) {
        processQueue(refreshError);
        const inactiveMsg =
          extractInactiveAccountForbiddenMessage(refreshError);
        if (!isSessionProbe || inactiveMsg) {
          redirectToLogin(inactiveMsg ?? undefined);
        }
        return Promise.reject(decorateError(refreshError as AxiosError));
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      const inactiveMsg = extractInactiveAccountForbiddenMessage(error);
      if (inactiveMsg) {
        redirectToLogin(inactiveMsg);
        return Promise.reject(decorateError(error));
      }
    }

    return Promise.reject(decorateError(error));
  },
);

/**
 * §3.6: Dispatch a custom DOM event instead of doing a hard navigation.
 * App.tsx listens for this event and calls React Router's navigate() so
 * we get a client-side transition (no full page reload, history preserved).
 */
function redirectToLogin(sessionMessage?: string) {
  localStorage.removeItem("user");
  window.dispatchEvent(
    new CustomEvent<{ message?: string }>("auth:expired", {
      detail: sessionMessage ? { message: sessionMessage } : undefined,
    }),
  );
}

/**
 * Attach a sanitised, user-displayable message on every rejected request
 * so callers can simply do `toast.error(err.friendlyMessage)` without
 * risking leakage of raw 5xx payloads.
 */
function decorateError(error: AxiosError): AxiosError {
  try {
    (error as AxiosError & { friendlyMessage?: string }).friendlyMessage =
      getFriendlyErrorMessage(error);
  } catch {
    /* never let the interceptor itself throw */
  }
  return error;
}

export default api;
