/**
 * §3.7: Central app configuration derived from environment variables.
 * All VITE_* vars must be referenced here — never scatter import.meta.env
 * calls across the codebase.
 */

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (import.meta.env.PROD && !apiUrl) {
  // Fail loudly in production so a misconfigured deployment is caught
  // immediately rather than silently hitting localhost.
  throw new Error(
    "[config] VITE_API_URL is not set. Add it to your deployment environment variables.",
  );
}

export const API_BASE_URL = apiUrl ?? "http://localhost:3000/api/v1";
