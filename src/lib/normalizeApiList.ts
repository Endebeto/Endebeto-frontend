/**
 * §3.17 rollout helpers: older APIs nested lists as `data: { data: T[] }`;
 * newer APIs use `data: T[]` and put the full count in `total` (per-page count in `results`).
 */
export function normalizeApiList<T>(
  body:
    | { data?: T[] | { data?: T[] }; total?: number; results?: number }
    | undefined
    | null,
): { items: T[]; total: number } {
  if (!body) return { items: [], total: 0 };
  const raw = body.data;
  if (Array.isArray(raw)) {
    return { items: raw, total: body.total ?? 0 };
  }
  if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
    return {
      items: raw.data,
      total: body.total ?? body.results ?? 0,
    };
  }
  return { items: [], total: body.total ?? body.results ?? 0 };
}
