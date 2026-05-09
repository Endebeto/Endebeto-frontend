import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  extractInactiveAccountForbiddenMessage,
  getFriendlyErrorMessage,
} from "./errors";
import { logger } from "./logger";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
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

// Paths where a 401 must NOT trigger a refresh attempt (would cause loops or
// are already handling credential errors themselves).
const NO_REFRESH_PATHS = [
  "/users/refresh",
  "/users/login",
  "/users/signup",
  "/users/forgotPassword",
  "/users/updateMyPassword",
];

// Response interceptor: normalise errors, attempt token refresh on 401.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log only to our dev-only logger — production builds silence it.
    const isSessionProbe401 = status === 401 && url.includes("/users/me");
    if (!isSessionProbe401) {
      logger.error("[api]", url, status);
    }

    if (status === 401) {
      // Wrong current password returns 401 — don't force logout on Profile.
      if (url.includes("/users/updateMyPassword")) {
        return Promise.reject(decorateError(error));
      }

      // Do not retry refresh endpoint or other public auth endpoints.
      const skipRefresh = NO_REFRESH_PATHS.some((p) => url.includes(p));
      // Also skip if we already retried once (avoid infinite loop).
      if (skipRefresh || originalConfig._retry) {
        redirectToLogin();
        return Promise.reject(decorateError(error));
      }

      // NOTE: /users/me is used as a session probe on app load — a 401 is
      // expected when the user is not logged in. Don't try to refresh here
      // as it would generate a spurious /refresh call for every unauthenticated
      // page load.
      if (url.includes("/users/me")) {
        return Promise.reject(decorateError(error));
      }

      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes.
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalConfig))
          .catch((e) => Promise.reject(decorateError(e as AxiosError)));
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        await api.post("/users/refresh");
        processQueue(null);
        return api(originalConfig);
      } catch (refreshError) {
        processQueue(refreshError);
        const inactiveMsg = extractInactiveAccountForbiddenMessage(
          refreshError,
        );
        redirectToLogin(inactiveMsg ?? undefined);
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
