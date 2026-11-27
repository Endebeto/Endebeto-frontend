/**
 * §3.7: Central app configuration derived from environment variables.
 * All VITE_* vars must be referenced here — never scatter import.meta.env
 * calls across the codebase.
 */

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (import.meta.env.PROD && !apiUrl?.trim()) {
  // Fail loudly in production so a misconfigured deployment is caught
  // immediately rather than silently hitting localhost.
  throw new Error(
    "[config] VITE_API_URL is not set. Add it to your deployment environment variables.",
  );
}

if (import.meta.env.PROD && /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(apiUrl ?? "")) {
  // P2-19: a production bundle pointing at localhost means the host's
  // VITE_API_URL was not set and a local .env leaked into the build.
  console.error(
    "[config] VITE_API_URL points at localhost in a production build. Set it on the hosting platform.",
  );
}

/**
 * Production: set VITE_API_URL (full API base, or /api/v1 with SPA_PROXY_API_ORIGIN on the host).
 * Dev: defaults to /api/v1 (Vite proxy).
 */
export const API_BASE_URL =
  import.meta.env.PROD ? apiUrl!.trim() : apiUrl?.trim() || "/api/v1";
