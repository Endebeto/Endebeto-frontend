import { AxiosError } from "axios";

/**
 * Central place to derive a message safe to show the user.
 *
 * Rules:
 *  - Network / unknown errors             → `fallback` (never raw axios text)
 *  - 5xx responses                        → `fallback` (the backend already
 *    emits a generic message in production, but we belt-and-brace this)
 *  - 4xx responses with a backend message → use that message, trimmed
 *    and length-capped so a misbehaving upstream cannot dump megabytes
 *    into a toast.
 *
 * In development we pass a bit more through so engineers can debug.
 */

const DEFAULT_FALLBACK = "Something went wrong. Please try again.";
const MAX_USER_MESSAGE_LENGTH = 240;
const isDev = import.meta.env.DEV;

function sanitize(message: unknown): string | null {
  if (typeof message !== "string") return null;
  const trimmed = message.trim();
  if (!trimmed) return null;
  return trimmed.length > MAX_USER_MESSAGE_LENGTH
    ? `${trimmed.slice(0, MAX_USER_MESSAGE_LENGTH - 1)}…`
    : trimmed;
}

function extractBackendMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const anyErr = error as { response?: { data?: unknown } };
  const data = anyErr.response?.data;
  if (!data || typeof data !== "object") return null;
  const msg = (data as { message?: unknown }).message;
  return sanitize(msg);
}

/**
 * Convert any thrown value (axios error, Error, string, etc.) to a
 * user-friendly copy.  Never surfaces stack traces, DB paths, or raw
 * network failures to the UI.
 */
export function getFriendlyErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string {
  // If the axios interceptor has already tagged a safe message on this
  // error we can trust it without repeating the work.
  if (error && typeof error === "object" && "friendlyMessage" in error) {
    const fm = (error as { friendlyMessage?: unknown }).friendlyMessage;
    if (typeof fm === "string" && fm) return fm;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;

    if (status >= 400 && status < 500) {
      return extractBackendMessage(error) ?? fallback;
    }

    if (status >= 500) {
      return fallback;
    }

    // Network error / timeout / request never reached the server.
    return fallback;
  }

  // Non-axios object that still looks like one (e.g. thrown by react-query
  // after a transformation). Pull the backend message if present.
  const backendMsg = extractBackendMessage(error);
  if (backendMsg) return backendMsg;

  // In development, surface raw Error#message to speed up debugging.
  if (isDev && error instanceof Error) {
    return sanitize(error.message) ?? fallback;
  }

  return fallback;
}

/**
 * Lightweight helper used by legacy per-page `apiErrMessage` functions
 * to preserve their signature while centralising the logic.
 */
export function apiErrMessage(error: unknown, fallback?: string): string {
  return getFriendlyErrorMessage(error, fallback);
}
