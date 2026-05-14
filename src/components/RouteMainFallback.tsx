/** In-layout spinner while a lazy child route chunk loads (admin/host outlet). */
export function RouteMainFallback() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-background px-4 py-12"
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-xs font-medium text-on-surface-variant">Loading…</p>
    </div>
  );
}
