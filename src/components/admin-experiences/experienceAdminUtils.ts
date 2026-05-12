import type {
  AdminBookingStatus,
  AdminExperience,
} from "@/services/admin.service";

export type ExpStatus = "pending" | "approved" | "rejected" | "draft";
export type TabKey = "live" | "expired" | "suspended" | "draft";

export const CATALOG_PAGE_SIZE = 20;

export function isExpired(exp: AdminExperience): boolean {
  if (exp.status !== "approved" || exp.suspended) return false;
  if (!exp.nextOccurrenceAt) return true;
  return new Date(exp.nextOccurrenceAt).getTime() <= Date.now();
}

export function hostInitials(name: string) {
  return (
    name?.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() ??
    "??"
  );
}

export function fmtDuration(d: unknown) {
  if (d == null) return "–";
  if (typeof d === "string") return d;
  const mins = Number(d);
  if (Number.isNaN(mins)) return String(d);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function fmtDateSafe(iso?: string | null) {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export function locationText(exp: AdminExperience): string {
  const loc = exp.location as unknown;
  if (!loc) return "";
  if (typeof loc === "string") return loc;
  if (typeof loc === "object" && loc && "address" in (loc as object)) {
    return String((loc as { address?: string }).address ?? "");
  }
  return "";
}

export const statusBadge: Record<ExpStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-green-400 dark:border-emerald-800",
  rejected:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  draft:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600",
};

export const suspendedBadge =
  "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700";

export const expiredBadge =
  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";

export const TAB_LABEL: Record<TabKey, string> = {
  live: "Live",
  expired: "Expired",
  suspended: "Suspended",
  draft: "Drafts",
};

export const BOOKING_FILTERS: { key: "all" | AdminBookingStatus; label: string }[] =
  [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "expired", label: "Expired" },
  ];

export const BOOKING_STATUS_BADGE: Record<AdminBookingStatus, string> = {
  upcoming:
    "bg-primary/10 text-primary dark:bg-primary/20 dark:text-green-400 border-primary/20",
  completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-green-400 dark:border-emerald-800",
  cancelled:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  expired:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
};

export function fmtEtb(amount: number | undefined | null) {
  const value = Number(amount) || 0;
  return `ETB ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export const CATALOG_TAB_ITEMS: { key: TabKey; label: string }[] = [
  { key: "live", label: TAB_LABEL.live },
  { key: "expired", label: TAB_LABEL.expired },
  { key: "suspended", label: TAB_LABEL.suspended },
  { key: "draft", label: TAB_LABEL.draft },
];
