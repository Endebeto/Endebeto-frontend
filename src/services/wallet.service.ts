import api from "@/lib/api";

// Amounts from the backend are in cents (ETB 1 = 100 cents).
// Divide by 100 to display in ETB.

export interface Wallet {
  availableBalanceCents: number;
  pendingPayoutCents:    number;
  heldEarningsCents:     number;
  payoutInTransitCents:  number;
  currency:              string;
  totalEarnedCents:      number;
  totalFeesCents:        number;
}

export interface EarningRow {
  _id: string;
  date: string;
  type: "pending_credit" | "credit";
  status: "held" | "released";
  grossCents: number;
  feeCents: number;
  netCents: number;
  booking: {
    _id: string;
    status: string;
    quantity: number;
    experience: { title: string; imageCover?: string } | null;
  } | null;
}

export interface EarningsListResponse {
  status: string;
  results: number;
  total: number;
  page: number;
  pages: number;
  data: { earnings: EarningRow[] };
}

export interface WithdrawalDestination {
  bankName?:           string;
  accountName?:        string;
  accountNumberLast4?: string;
  accountNumber?:      string;
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
  /** Proof of bank transfer — set when admin marks paid */
  paymentReceiptUrl?: string;
}

export const walletService = {
  getWallet: () =>
    api.get<{ status: string; data: { wallet: Wallet } }>("/wallet"),

  getEarnings: (params?: { page?: number; limit?: number }) =>
    api.get<EarningsListResponse>("/wallet/earnings", { params }),

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
    /** Idempotency: same id + same host reuses one request if still pending (backend may enforce). */
    clientRequestId?: string;
  }) =>
    api.post<{ status: string; data: { withdrawal: WithdrawalRequest } }>(
      "/withdrawals",
      {
        amountCents: Math.round(payload.amountETB * 100),
        ...(payload.clientRequestId ? { clientRequestId: payload.clientRequestId } : {}),
        destination: {
          bankName:           payload.bankName,
          accountName:        payload.accountName,
          accountNumberLast4: payload.accountNumber.slice(-4),
          accountNumber:      payload.accountNumber.replace(/\s/g, ""),
        },
      }
    ),
};
