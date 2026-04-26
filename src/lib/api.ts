import axios, { AxiosError } from "axios";
import { getFriendlyErrorMessage } from "./errors";
import { logger } from "./logger";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
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

// Response interceptor: normalise errors, redirect on unauthenticated.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log only to our dev-only logger — production builds silence it.
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isSessionProbe401 = status === 401 && url.includes("/users/me");
    if (!isSessionProbe401) {
      logger.error("[api]", url, status);
    }

    if (status === 401) {
      // Wrong current password returns 401 — don't force logout on Profile
      if (url.includes("/users/updateMyPassword")) {
        return Promise.reject(decorateError(error));
      }
      // NOTE: /users/me is used for "session refresh" on app load; a 401 is normal
      // when not logged in or after secrets/env change. Do not hard-redirect-loop.
      const publicPaths = [
        "/users/login",
        "/users/signup",
        "/users/forgotPassword",
        "/users/me",
      ];
      const isPublic = publicPaths.some((p) => url.includes(p));
      if (!isPublic) {
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(decorateError(error));
  }
);

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
