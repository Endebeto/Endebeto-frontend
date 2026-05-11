/**
 * §3.19 — Uniform React Query keys for admin surfaces.
 * Every key starts with `"admin"`. Use the `*Prefix` entries with
 * `invalidateQueries({ queryKey: ... })` to bust all queries under that slice.
 */

export const adminQueryKeys = {
  stats: (compare: string) => ["admin", "stats", compare] as const,
  statsPrefix: ["admin", "stats"] as const,

  charts: (months: number) => ["admin", "charts", months] as const,
  chartsPrefix: ["admin", "charts"] as const,

  topExperiences: (by: string) => ["admin", "top-experiences", by] as const,
  topExperiencesPrefix: ["admin", "top-experiences"] as const,

  topHosts: () => ["admin", "top-hosts"] as const,
  topHostsPrefix: ["admin", "top-hosts"] as const,

  users: (filters: { page: number; search: string; statusFilter: string }) =>
    ["admin", "users", filters] as const,
  usersPrefix: ["admin", "users"] as const,

  reviews: (filters: { page: number; search: string }) =>
    ["admin", "reviews", filters] as const,
  reviewsPrefix: ["admin", "reviews"] as const,

  withdrawals: (filters: {
    tab: "pending" | "history";
    page: number;
    search: string;
  }) => ["admin", "withdrawals", filters] as const,
  withdrawalsPrefix: ["admin", "withdrawals"] as const,

  hostApplications: (status: string) => ["admin", "host-applications", status] as const,
  hostApplicationCounts: () => ["admin", "host-applications", "counts"] as const,
  hostApplicationsPrefix: ["admin", "host-applications"] as const,

  experiencesCatalog: (tab: string) => ["admin", "experiences", "catalog", tab] as const,
  experiencesCatalogPrefix: ["admin", "experiences", "catalog"] as const,

  experienceDetail: (id: string) => ["admin", "experiences", "detail", id] as const,
  experienceDetailPrefix: ["admin", "experiences", "detail"] as const,

  experienceBookings: (expId: string, filter: string, page: number) =>
    ["admin", "experiences", "bookings", expId, filter, page] as const,
  experienceBookingsPrefix: ["admin", "experiences", "bookings"] as const,
} as const;
