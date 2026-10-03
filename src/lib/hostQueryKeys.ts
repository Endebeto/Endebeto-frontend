/**
 * Uniform React Query key factory for host dashboards and sub-views.
 * Ensures synchronized cache invalidation across Dashboard, Experiences, Bookings,
 * and Wallet views without stale cache divergence.
 */

export const hostQueryKeys = {
  dashboard: () => ["host", "dashboard"] as const,

  experiences: {
    all: () => ["host", "experiences"] as const,
    list: () => ["host", "experiences", "list"] as const,
    detail: (id: string) => ["host", "experiences", "detail", id] as const,
  },

  bookings: {
    all: () => ["host", "bookings"] as const,
    list: (tab?: string, page?: number, search?: string) =>
      ["host", "bookings", "list", { tab, page, search }] as const,
  },

  wallet: {
    all: () => ["host", "wallet"] as const,
    summary: () => ["host", "wallet", "summary"] as const,
    earnings: (page?: number) => ["host", "wallet", "earnings", page] as const,
    withdrawals: (tab: string, page: number, search?: string) =>
      ["host", "wallet", "withdrawals", { tab, page, search }] as const,
  },

  application: () => ["host", "application"] as const,
} as const;

export default hostQueryKeys;
