import api from "@/lib/api";

/* ─── Platform Stats ─────────────────────────────────────── */
export type CompareWindow = "rolling30" | "month";

export interface PlatformStatsWindow {
  start: string;
  end: string;
}

export interface PlatformStats {
  /* Totals (lifetime / current state) */
  totalUsers: number;
  approvedHosts: number;
  suspendedUsers: number;
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingApplications: number;
  draftExperiences: number;
  pendingExperiences: number;
  /** Approved & publicly visible (not suspended) */
  liveExperiences: number;
  suspendedExperiences: number;

  /* Money — all cents */
  grossRevenueCents: number;
  platformFeesCents: number;
  avgBookingValueCents: number;

  /* Period-over-period pairs (current vs previous window) */
  newUsersCurr: number;
  newUsersPrev: number;
  newHostsCurr: number;
  newHostsPrev: number;
  bookingsCurr: number;
  bookingsPrev: number;
  grossRevenueCurrCents: number;
  grossRevenuePrevCents: number;
  platformFeesCurrCents: number;
  platformFeesPrevCents: number;

  /* Payouts */
  pendingWithdrawalsCount: number;
  pendingWithdrawalsCents: number;
  paidWithdrawalsLifetimeCents: number;
  failedWithdrawalsCount: number;

  /* Reviews / ratings */
  totalReviews: number;
  reviewsCurr: number;
  /** Weighted average over approved experiences' ratings (0 when no ratings). */
  avgPlatformRating: number;

  /* Meta */
  platformFeeRate: number;
  compareWindow: CompareWindow;
  windows: { curr: PlatformStatsWindow; prev: PlatformStatsWindow };
}

export interface DashboardCharts {
  labels: string[];
  newUsers: number[];
  bookings: number[];
  revenueCents: number[];
  feesCents: number[];
}

export interface TopExperienceHost {
  _id?: string;
  name?: string;
  email?: string;
  photo?: string;
}

export interface TopExperience {
  _id: string;
  title: string;
  imageCover?: string;
  price?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  nextOccurrenceAt?: string | null;
  suspended?: boolean;
  bookings: number;
  grossCents: number;
  host?: TopExperienceHost | null;
}

export interface TopHost {
  _id: string;
  name?: string;
  email?: string;
  photo?: string;
  phone?: string;
  hostStatus?: "pending" | "approved" | "rejected" | "none" | null;
  bookings: number;
  grossCents: number;
  experiencesCount: number;
}

/* ─── Guest reviews (moderation) ───────────────────────────── */
export interface AdminReview {
  _id: string;
  review: string;
  rating: number;
  createdAt: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
    photo?: string;
  };
  experience: {
    _id: string;
    title?: string;
    slug?: string;
  } | null;
}

/* ─── Host Applications ──────────────────────────────────── */
export interface HostApplicationMedia {
  nationalIdFront?: string;
  nationalIdBack?: string;
  personalPhoto?: string;
  environmentPhotos?: string[];
}

export interface AdminHostApplication {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  media?: HostApplicationMedia;
  personalInfo?: {
    bio?: string;
    languages?: string[];
    region?: string;
    yearsOfExperience?: number;
  };
  experienceDetails?: {
    experienceTypes?: string[];
    description?: string;
  };
  rejectionReason?: string;
}

/* ─── Admin Experiences ──────────────────────────────────── */
export interface AdminExperience {
  _id: string;
  title: string;
  slug?: string;
  status: "pending" | "approved" | "rejected" | "draft";
  host: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
    phone?: string;
    hostStory?: string;
    hostStatus?: "pending" | "approved" | "rejected" | "none" | null;
    createdAt?: string;
    bio?: string;
  };
  price: number;
  duration: number | string;
  maxGuests: number;
  nextOccurrenceAt?: string;
  createdAt: string;
  imageCover?: string;
  images?: string[];
  summary?: string;
  description?: string;
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
  ratingsAverage?: number;
  ratingsQuantity?: number;
  rejectionReason?: string;
  suspended?: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: { _id: string; name?: string; email?: string };
}

export type AdminBookingStatus =
  | "upcoming"
  | "completed"
  | "expired"
  | "cancelled";

export interface AdminExperienceBookingStats {
  upcoming: number;
  completed: number;
  cancelled: number;
  expired: number;
  totalGuestsServed: number;
  upcomingGuests: number;
  grossRevenue: number;
  completedRevenue: number;
}

export interface AdminBooking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
    phone?: string;
  } | null;
  price: number;
  quantity: number;
  status: AdminBookingStatus;
  paid: boolean;
  txRef?: string;
  experienceDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface SuspendExperienceNotifications {
  hostEmailed: boolean;
  guestsEmailed: number;
  emailConfigured: boolean;
}

/* ─── Admin Users ────────────────────────────────────────── */
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role: "admin" | "host" | "user";
  hostStatus?: "pending" | "approved" | "rejected" | "none" | null;
  active: boolean;
  isVerified?: boolean;
  /** @deprecated use authProvider */
  provider?: string;
  /** Backend field: local | google | facebook (legacy) */
  authProvider?: string;
  googleId?: string;
  facebookId?: string;
  createdAt?: string;
  suspensionReason?: string | null;
  suspendedAt?: string | null;
  suspendedBy?: { _id: string; name?: string; email?: string } | null;
  hostListingSuspended?: boolean;
  hostListingSuspendedReason?: string | null;
  hostListingSuspendedAt?: string | null;
  hostListingSuspendedBy?: { _id: string; name?: string; email?: string } | null;
}

/* ─── Withdrawals ────────────────────────────────────────── */
export interface AdminWithdrawal {
  _id: string;
  host: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
    cbeAccountName?: string;
    cbeAccountNumber?: string;
  };
  amountCents: number;
  amountETB?: number;
  status: "pending_transfer" | "paid" | "failed";
  destination?: {
    bankName?: string;
    accountName?: string;
    accountNumberLast4?: string;
    accountNumber?: string;
  };
  /** @deprecated prefer destination + host banking */
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
  paymentReceiptUrl?: string;
}

/* ─── API calls ──────────────────────────────────────────── */
export const adminService = {
  /* Stats */
  getStats: (params?: { compare?: CompareWindow }) =>
    api.get<{ status: string; data: PlatformStats }>("/admin/stats", {
      params,
    }),

  getDashboardCharts: (params?: { months?: number }) =>
    api.get<{ status: string; data: DashboardCharts }>(
      "/admin/dashboard/charts",
      { params },
    ),

  getTopExperiences: (params?: {
    limit?: number;
    by?: "revenue" | "bookings" | "rating";
  }) =>
    api.get<{ status: string; data: TopExperience[] }>(
      "/admin/dashboard/top-experiences",
      { params },
    ),

  getTopHosts: (params?: { limit?: number }) =>
    api.get<{ status: string; data: TopHost[] }>(
      "/admin/dashboard/top-hosts",
      { params },
    ),

  getAdminReviews: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    minRating?: number;
    maxRating?: number;
  }) =>
    api.get<{
      status: string;
      results: number;
      page: number;
      pages: number;
      data: { data: AdminReview[] };
    }>("/admin/reviews", { params }),

  deleteReview: (id: string) => api.delete(`/reviews/${id}`),

  /* Host Applications */
  getHostApplications: (params?: { status?: string }) =>
    api.get<{
      status: string;
      results: number;
      data: { applications: AdminHostApplication[] };
    }>("/host-applications/admin/all", { params }),
  approveHostApplication: (id: string, notes?: string) =>
    api.patch(`/host-applications/${id}/approve`, { notes }),
  rejectHostApplication: (id: string, reason: string) =>
    api.patch(`/host-applications/${id}/reject`, { rejectionReason: reason }),

  /** Admin catalog: filter = live | expired | suspended | draft */
  getAdminCatalog: (
    filter: "live" | "expired" | "suspended" | "draft",
    params?: { page?: number; limit?: number },
  ) =>
    api.get<{
      status: string;
      results: number;
      page?: number;
      pages?: number;
      data: { data: AdminExperience[] };
    }>("/experiences/admin/catalog", { params: { filter, ...params } }),

  suspendExperience: (id: string, reason: string) =>
    api.patch<{
      status: string;
      data: {
        data: AdminExperience;
        notifications: SuspendExperienceNotifications;
      };
    }>(`/experiences/${id}/suspend`, { reason }),

  reinstateExperience: (id: string) =>
    api.patch<{
      status: string;
      data: {
        data: AdminExperience;
        notifications: { guestsEmailed: number; emailConfigured: boolean };
      };
    }>(`/experiences/${id}/reinstate`),

  getAdminExperienceDetail: (id: string) =>
    api.get<{
      status: string;
      data: {
        experience: AdminExperience;
        bookingStats: AdminExperienceBookingStats;
      };
    }>(`/experiences/${id}/admin-detail`),

  getAdminExperienceBookings: (
    id: string,
    params?: { status?: AdminBookingStatus; page?: number; limit?: number },
  ) =>
    api.get<{
      status: string;
      results: number;
      total: number;
      page: number;
      pages: number;
      data: AdminBooking[];
    }>(`/experiences/${id}/admin-bookings`, { params }),

  /* Users */
  /** Backend factory.getAll: `data: { data: User[] }` */
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: "all" | "active" | "suspended";
  }) =>
    api.get<{
      status: string;
      results: number;
      data: { data: AdminUser[] };
    }>("/users", { params }),
  updateUser: (id: string, data: Partial<{ role: string; active: boolean }>) =>
    api.patch(`/users/${id}`, data),
  suspendUser: (id: string, reason?: string) =>
    api.patch<{
      status: string;
      data: {
        data: AdminUser;
        notifications: { userEmailed: boolean; emailConfigured: boolean };
      };
    }>(`/users/${id}/suspend`, { reason }),
  reinstateUser: (id: string) =>
    api.patch<{
      status: string;
      data: {
        data: AdminUser;
        notifications: { userEmailed: boolean; emailConfigured: boolean };
      };
    }>(`/users/${id}/reinstate`),

  suspendHostListings: (id: string, reason?: string) =>
    api.patch<{
      status: string;
      data: {
        data: AdminUser;
        notifications: { userEmailed: boolean; emailConfigured: boolean };
      };
    }>(`/users/${id}/suspend-host-listings`, { reason }),

  reinstateHostListings: (id: string) =>
    api.patch<{
      status: string;
      data: {
        data: AdminUser;
        notifications: { userEmailed: boolean; emailConfigured: boolean };
      };
    }>(`/users/${id}/reinstate-host-listings`),

  deleteUser: (id: string) => api.delete(`/users/${id}`),

  /* Withdrawals / Payouts */
  getWithdrawals: (params?: { status?: string }) =>
    api.get<{
      status: string;
      results: number;
      data: { withdrawals: AdminWithdrawal[] };
    }>("/admin/payouts/withdrawals", { params }),
  markWithdrawalPaid: (id: string, paymentReceiptUrl: string) =>
    api.post(`/admin/payouts/withdrawals/${id}/mark-paid`, {
      paymentReceiptUrl: paymentReceiptUrl.trim(),
    }),
  markWithdrawalFailed: (id: string, reason?: string) =>
    api.post(`/admin/payouts/withdrawals/${id}/mark-failed`, { reason }),
  exportPayouts: () =>
    api.post<{
      status: string;
      data: { csv: string; filename: string; count: number };
    }>("/admin/payouts/exports"),
};
