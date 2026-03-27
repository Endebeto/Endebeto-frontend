import api from "@/lib/api";

// Amounts from the backend are in cents (ETB 1 = 100 cents).
// Divide by 100 to display in ETB.

export interface Wallet {
  availableBalanceCents: number;
  pendingPayoutCents:    number;
  currency:              string;
}

export interface WithdrawalDestination {
  bankName?:           string;
  accountName?:        string;
  accountNumberLast4?: string;
}

export interface WithdrawalRequest {
  _id:         string;
  amountCents: number;
  currency:    string;
  status:      "pending_transfer" | "paid" | "failed" | "canceled";
  destination?: WithdrawalDestination;
  createdAt:   string;
  processedAt?: string;
  failureReason?: string;
}

export const walletService = {
  getWallet: () =>
    api.get<{ status: string; data: { wallet: Wallet } }>("/wallet"),

  getWithdrawals: (params?: { page?: number; limit?: number }) =>
    api.get<{
      status: string;
      results: number;
      total: number;
      page: number;
      limit: number;
      data: { withdrawals: WithdrawalRequest[] };
    }>("/withdrawals", { params }),

  // amountETB: the human-readable amount in ETB (e.g. 500)
  // The backend expects amountCents, so we multiply by 100 here.
  createWithdrawal: (payload: {
    amountETB: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
  }) =>
    api.post<{ status: string; data: { withdrawal: WithdrawalRequest } }>(
      "/withdrawals",
      {
        amountCents: Math.round(payload.amountETB * 100),
        destination: {
          bankName:           payload.bankName,
          accountName:        payload.accountName,
          accountNumberLast4: payload.accountNumber.slice(-4),
        },
      }
    ),
};
