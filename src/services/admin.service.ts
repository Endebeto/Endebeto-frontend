import api from "@/lib/api";

/* ─── Platform Stats ─────────────────────────────────────── */
export interface PlatformStats {
  totalUsers: number;
  newUsersThisMonth: number;
  approvedHosts: number;
  totalBookings: number;
  grossRevenue: number;
  platformFeesCollected: number;
  pendingApplications: number;
  /** Unpublished drafts (not pending admin approval) */
  draftExperiences: number;
  /** Approved & publicly visible (not suspended) */
  liveExperiences: number;
  suspendedExperiences: number;
}

export interface DashboardCharts {
  labels: string[];
  newUsers: number[];
  bookings: number[];
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

/* ─── Admin Users ────────────────────────────────────────── */
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  role: "admin" | "host" | "user";
  hostStatus?: "pending" | "approved" | "rejected" | "none" | null;
  active: boolean;
  isVerified?: boolean;
  /** @deprecated use authProvider */
  provider?: string;
  /** Backend field: local | google | facebook */
  authProvider?: string;
  googleId?: string;
  facebookId?: string;
  createdAt?: string;
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
  getStats: () =>
    api.get<{ status: string; data: PlatformStats }>("/admin/stats"),

  getDashboardCharts: (params?: { months?: number }) =>
    api.get<{ status: string; data: DashboardCharts }>(
      "/admin/dashboard/charts",
      { params },
    ),

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

  /** Admin catalog: filter = live | suspended | draft */
  getAdminCatalog: (
    filter: "live" | "suspended" | "draft",
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
    api.patch(`/experiences/${id}/suspend`, { reason }),

  reinstateExperience: (id: string) =>
    api.patch(`/experiences/${id}/reinstate`),

  /* Users */
  /** Backend factory.getAll: `data: { data: User[] }` */
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) =>
    api.get<{
      status: string;
      results: number;
      data: { data: AdminUser[] };
    }>("/users", { params }),
  updateUser: (id: string, data: Partial<{ role: string; active: boolean }>) =>
    api.patch(`/users/${id}`, data),
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
