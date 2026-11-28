/**
 * Refund design (docs/REFUND_DESIGN.md): host-chosen free-cancellation
 * windows. Mirrors backend/utils/cancellationPolicy.js.
 */
export type CancellationPolicy = "24h" | "48h" | "7d" | "none";

export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = "24h";

export const CANCELLATION_POLICY_OPTIONS: Array<{
  value: CancellationPolicy;
  label: string;
  hint: string;
}> = [
  { value: "24h", label: "24 hours", hint: "Free cancellation up to 24 hours before the session" },
  { value: "48h", label: "48 hours", hint: "Free cancellation up to 48 hours before the session" },
  { value: "7d", label: "7 days", hint: "Free cancellation up to 7 days before the session" },
  { value: "none", label: "No free cancellation", hint: "Guests are not refunded if they cancel" },
];

const POLICY_HOURS: Record<CancellationPolicy, number | null> = {
  "24h": 24,
  "48h": 48,
  "7d": 7 * 24,
  none: null,
};

export function normalisePolicy(p: unknown): CancellationPolicy {
  return p === "24h" || p === "48h" || p === "7d" || p === "none"
    ? p
    : DEFAULT_CANCELLATION_POLICY;
}

/** Short line for listing pages, e.g. "Free cancellation up to 48 hours before". */
export function policySummary(p: unknown): string {
  const policy = normalisePolicy(p);
  return CANCELLATION_POLICY_OPTIONS.find((o) => o.value === policy)!.hint;
}

/** Cutoff for a session start, or null when there is no free cancellation. */
export function freeCancelUntil(p: unknown, sessionStart: string | Date | null | undefined): Date | null {
  const hours = POLICY_HOURS[normalisePolicy(p)];
  if (hours == null || !sessionStart) return null;
  const start = new Date(sessionStart).getTime();
  if (!Number.isFinite(start)) return null;
  return new Date(start - hours * 60 * 60 * 1000);
}

/**
 * Line for checkout / booking cards:
 *   "Free cancellation until Sat 14 Dec, 10:00" (cutoff in the future)
 *   "No free cancellation for this session"     (none, or cutoff passed)
 */
export function cutoffLabel(cutoff: Date | string | null | undefined, now = new Date()): string {
  if (!cutoff) return "No free cancellation for this session";
  const d = new Date(cutoff);
  if (d.getTime() <= now.getTime()) return "No free cancellation for this session";
  const when = d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Free cancellation until ${when}`;
}

export const etb = (cents: number) =>
  `ETB ${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
