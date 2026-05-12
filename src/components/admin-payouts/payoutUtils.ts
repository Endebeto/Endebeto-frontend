import type { AdminWithdrawal } from "@/services/admin.service";

export type PayoutStatus = "pending_transfer" | "paid" | "failed" | "canceled";

export const PAYOUT_STATUS_STYLES: Record<
  PayoutStatus,
  { pill: string; dot: string; label: string }
> = {
  pending_transfer: {
    pill: "bg-tertiary-fixed text-on-tertiary-fixed",
    dot: "bg-on-tertiary-container",
    label: "Pending",
  },
  paid: {
    pill: "bg-secondary-container text-on-secondary-container",
    dot: "bg-on-primary-container",
    label: "Paid",
  },
  failed: {
    pill: "bg-error-container text-on-error-container",
    dot: "bg-error",
    label: "Failed",
  },
  canceled: {
    pill: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    dot: "bg-zinc-400",
    label: "Cancelled",
  },
};

export const PAGE_SIZE = 10;

export function visiblePages(
  current: number,
  total: number,
  max = 7,
): number[] {
  if (total <= 0) return [1];
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function payoutInitials(name: string) {
  return (
    name
      ?.split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() ?? "??"
  );
}

export function fmtETB(cents: number) {
  return (cents / 100).toLocaleString("en-ET", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function bankDetailsForPayout(wr: AdminWithdrawal): {
  bank: string;
  accountName: string;
  accountNumber: string;
} {
  const dest = wr.destination;
  const host = wr.host;
  const bank = dest?.bankName ?? host?.hostPayoutBankName ?? "—";
  const accountName = dest?.accountName ?? host?.hostPayoutAccountName ?? "—";
  const accountNumber =
    dest?.accountNumber ??
    (dest?.accountNumberLast4 ? `•••• ${dest.accountNumberLast4}` : "—");
  return { bank, accountName, accountNumber };
}

export function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
