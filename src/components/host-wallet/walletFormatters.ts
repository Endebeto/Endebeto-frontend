export const etb = (cents: number) =>
  (cents / 100).toLocaleString("en-ET", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const PAGE_SIZE = 10;

export const statusCfg: Record<string, { label: string; cls: string }> = {
  pending_transfer: {
    label: "Pending",
    cls: "bg-[#ffddb8]/60 text-[#653e00] dark:bg-amber-900/40 dark:text-amber-300",
  },
  paid: {
    label: "Paid",
    cls: "bg-secondary-container text-on-secondary-fixed-variant dark:bg-emerald-900/40 dark:text-green-400",
  },
  failed: {
    label: "Failed",
    cls: "bg-error-container text-on-error-container dark:bg-red-900/40 dark:text-red-300",
  },
  canceled: {
    label: "Cancelled",
    cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

export const PAYOUT_BANKS = [
  "Commercial Bank of Ethiopia (CBE)",
  "Bank of Abyssinia (BOA)",
  "Awash Bank",
] as const;
