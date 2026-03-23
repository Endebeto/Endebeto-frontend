import api from "@/lib/api";

export interface Wallet {
  _id: string;
  host: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  _id: string;
  host: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "failed";
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

export const walletService = {
  getWallet: () =>
    api.get<{ status: string; data: { wallet: Wallet } }>("/wallet"),

  getWithdrawals: () =>
    api.get<{ status: string; results: number; data: { withdrawals: WithdrawalRequest[] } }>(
      "/withdrawals"
    ),

  createWithdrawal: (payload: {
    amount: number;
    bankDetails: WithdrawalRequest["bankDetails"];
  }) =>
    api.post<{ status: string; data: { withdrawal: WithdrawalRequest } }>(
      "/withdrawals",
      payload
    ),
};
