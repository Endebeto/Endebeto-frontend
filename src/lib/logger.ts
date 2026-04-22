/**
 * In production we don't want raw server/network errors ending up in the
 * browser devtools console either — they can include stack frames, HTTP
 * request metadata, or third-party library output that a curious user may
 * report or screenshot.  The helpers here give us a single switch for the
 * whole app.
 *
 * `initProductionLogger()` is called once from `main.tsx` and silences
 * the noisy console methods when `import.meta.env.PROD` is true.  We
 * keep `warn` / `error` available but route them to a no-op so third
 * party libs don't crash.
 */

type ConsoleMethod = "log" | "info" | "debug" | "warn" | "error";

const methodsToSilence: ConsoleMethod[] = [
  "log",
  "info",
  "debug",
  "warn",
  "error",
];

export function initProductionLogger(): void {
  if (!import.meta.env.PROD) return;

  for (const method of methodsToSilence) {
    try {
      // eslint-disable-next-line no-console
      console[method] = () => {};
    } catch {
      // some browsers reject reassignment — fine to ignore
    }
  }
}

/**
 * Safe logger for internal diagnostics.  Calls through in development,
 * becomes a no-op in production.  Prefer this over `console.*` in the
 * application code.
 */
export const logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
};
