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

export interface PayoutAccount {
  hasAccount: boolean;
  bankName: string | null;
  accountName: string | null;
  /** e.g. "•••• 1234" */
  accountNumberMasked: string | null;
  accountNumberLast4: string | null;
  updatedAt: string | null;
  /** ISO; withdrawals are blocked until then after a change of an existing account. */
  holdUntil: string | null;
  /** True when an account exists and the user is a local-password user. */
  requiresPassword: boolean;
  /** True when an account exists and the user signs in with OAuth/passwordless (requires Email OTP). */
  requiresOtp: boolean;
  allowedBanks: string[];
}

export interface SavePayoutAccountInput {
  bankName: string;
  accountName: string;
  /** Digits only, 8-20 */
  accountNumber: string;
  currentPassword?: string;
  otp?: string;
}

export const walletService = {
  getWallet: () =>
    api.get<{ status: string; data: { wallet: Wallet } }>("/wallet"),

  getEarnings: (params?: { page?: number; limit?: number }) =>
    api.get<EarningsListResponse>("/wallet/earnings", { params }),

  getWithdrawals: (params?: {
    page?: number;
    limit?: number;
    tab?: "pending" | "history";
    q?: string;
  }) =>
    api.get<{
      status: string;
      results: number;
      total: number;
      page: number;
      limit: number;
      pages: number;
      data: { withdrawals: WithdrawalRequest[] };
    }>("/withdrawals", { params }),

  // amountETB: the human-readable amount in ETB (e.g. 500)
  // The backend expects amountCents, so we multiply by 100 here.
  // The payout destination is the saved payout account (server-side).
  createWithdrawal: (payload: {
    amountETB: number;
    /** Idempotency: same id + same host reuses one request if still pending (backend may enforce). */
    clientRequestId?: string;
  }) =>
    api.post<{ status: string; data: { withdrawal: WithdrawalRequest } }>(
      "/withdrawals",
      {
        amountCents: Math.round(payload.amountETB * 100),
        ...(payload.clientRequestId
          ? { clientRequestId: payload.clientRequestId }
          : {}),
      },
    ),

  getPayoutAccount: () =>
    api.get<{ status: string; data: { payoutAccount: PayoutAccount } }>(
      "/users/me/payout-account",
    ),

  savePayoutAccount: (payload: SavePayoutAccountInput) =>
    api.put<{ status: string; data: { payoutAccount: PayoutAccount } }>(
      "/users/me/payout-account",
      payload,
    ),

  sendPayoutAccountOtp: () =>
    api.post<{ status: string; message: string }>(
      "/users/me/payout-account/send-otp",
    ),
};
