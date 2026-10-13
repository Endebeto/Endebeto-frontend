const OAUTH_REDIRECT_KEY = "auth:postLoginRedirect";

/** Only allow same-origin absolute paths ("/x"), never "//host" or "/\host". */
export function isSafeInternalPath(p: unknown): p is string {
  return (
    typeof p === "string" &&
    p.startsWith("/") &&
    !p.startsWith("//") &&
    !p.startsWith("/\\") &&
    !/[\r\n]/.test(p)
  );
}

type FromLike = string | { pathname?: string; search?: string; hash?: string };

/** Resolve `location.state.from` (string or Location) to a safe path, default "/". */
export function resolveFrom(state: unknown, fallback = "/"): string {
  const from = (state as { from?: FromLike } | null | undefined)?.from;
  let path: string | undefined;
  if (typeof from === "string") path = from;
  else if (from && typeof from === "object") {
    path = `${from.pathname ?? ""}${from.search ?? ""}${from.hash ?? ""}`;
  }
  return isSafeInternalPath(path) ? path : fallback;
}

export function saveOAuthRedirect(path: string) {
  try {
    if (isSafeInternalPath(path) && path !== "/") {
      sessionStorage.setItem(OAUTH_REDIRECT_KEY, path);
    } else {
      sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
    }
  } catch {
    /* storage unavailable */
  }
}

export function consumeOAuthRedirect(fallback = "/"): string {
  try {
    const v = sessionStorage.getItem(OAUTH_REDIRECT_KEY);
    sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
    return isSafeInternalPath(v) ? v : fallback;
  } catch {
    return fallback;
  }
}
