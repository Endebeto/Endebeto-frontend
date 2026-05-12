import type { PlatformStats } from "@/services/admin.service";

export function fmtNum(n: number) {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

/** All money numbers from the backend are in cents. */
export function fmtEtb(cents: number) {
  const etb = (cents ?? 0) / 100;
  if (!Number.isFinite(etb)) return "0";
  if (Math.abs(etb) >= 1_000_000) return `${(etb / 1_000_000).toFixed(1)}M`;
  if (Math.abs(etb) >= 1_000) return `${(etb / 1_000).toFixed(1)}k`;
  return etb.toFixed(0);
}

export function fmtEtbFull(cents: number) {
  const etb = (cents ?? 0) / 100;
  return etb.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Chart series values are already ETB (API cents were divided by 100 in the row builder). */
export function fmtEtbMajorUnits(etb: number) {
  if (!Number.isFinite(etb)) return "0";
  return etb.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Y-axis tick labels for large ETB amounts (not dollar-scale). */
export function formatEtbAxisTick(v: number) {
  if (!Number.isFinite(v)) return "";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return v.toFixed(0);
}

/**
 * Top of Y domain: peak (revenue or fees for current toggle) + headroom, rounded to a
 * readable step so lines sit lower than the top edge for multi‑digit birr values.
 */
export function computeEtbAreaYMax(
  rows: { revenue: number; fees: number }[],
  key: "revenue" | "fees",
) {
  if (!rows.length) return 10_000;
  const peak = Math.max(0, ...rows.map((r) => Number(r[key]) || 0));
  if (peak === 0) return 5_000;
  const target = peak * 1.28;
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(target, 1)));
  const step = Math.max(magnitude / 5, 500);
  return Math.ceil(target / step) * step;
}

export const EMPTY_STATS: PlatformStats = {
  totalUsers: 0,
  approvedHosts: 0,
  suspendedUsers: 0,
  totalBookings: 0,
  upcomingBookings: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  pendingApplications: 0,
  draftExperiences: 0,
  pendingExperiences: 0,
  liveExperiences: 0,
  expiredExperiences: 0,
  suspendedExperiences: 0,

  grossRevenueCents: 0,
  platformFeesCents: 0,
  avgBookingValueCents: 0,

  newUsersCurr: 0,
  newUsersPrev: 0,
  newHostsCurr: 0,
  newHostsPrev: 0,
  bookingsCurr: 0,
  bookingsPrev: 0,
  grossRevenueCurrCents: 0,
  grossRevenuePrevCents: 0,
  platformFeesCurrCents: 0,
  platformFeesPrevCents: 0,

  pendingWithdrawalsCount: 0,
  pendingWithdrawalsCents: 0,
  paidWithdrawalsLifetimeCents: 0,
  failedWithdrawalsCount: 0,

  totalReviews: 0,
  reviewsCurr: 0,
  avgPlatformRating: 0,

  platformFeeRate: 0.15,
  compareWindow: "rolling30",
  windows: {
    curr: { start: "", end: "" },
    prev: { start: "", end: "" },
  },
};
