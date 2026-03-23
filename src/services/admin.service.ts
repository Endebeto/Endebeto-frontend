import api from "@/lib/api";

export interface AdminStats {
  totalExperiences: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  pendingApplications: number;
  pendingExperiences: number;
}

export interface WithdrawalAdmin {
  _id: string;
  host: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: "pending" | "approved" | "paid" | "failed";
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

export const adminService = {
  exportPayouts: (params?: { startDate?: string; endDate?: string }) =>
    api.post("/admin/payouts/exports", params),

  getWithdrawals: (params?: { status?: string; page?: number }) =>
    api.get<{ status: string; results: number; data: { withdrawals: WithdrawalAdmin[] } }>(
      "/admin/payouts/withdrawals",
      { params }
    ),

  markWithdrawalPaid: (withdrawalId: string) =>
    api.post(`/admin/payouts/withdrawals/${withdrawalId}/mark-paid`),

  markWithdrawalFailed: (withdrawalId: string, reason?: string) =>
    api.post(`/admin/payouts/withdrawals/${withdrawalId}/mark-failed`, { reason }),
};
