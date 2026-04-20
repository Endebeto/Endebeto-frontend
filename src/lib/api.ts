import axios from "axios";

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

// On 401, clear stored credentials and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      // Wrong current password returns 401 — don't force logout on Profile
      if (url.includes("/users/updateMyPassword")) {
        return Promise.reject(error);
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
    return Promise.reject(error);
  }
);

export default api;
