import type { Booking } from "@/services/bookings.service";

export const REVIEW_WINDOW_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isPastOrEqualExperienceDate(iso?: string): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t <= Date.now();
}

export function isWithinReviewWindow(experienceDateIso?: string): boolean {
  if (!experienceDateIso) return false;
  const t = new Date(experienceDateIso).getTime();
  if (Number.isNaN(t)) return false;
  const deadline = t + REVIEW_WINDOW_DAYS * MS_PER_DAY;
  return Date.now() <= deadline;
}

/** Same rules as the “Write review” UI: completed, paid, date passed, within 7-day window. */
export function canOfferReview(booking: Booking): boolean {
  return (
    booking.paid &&
    booking.status === "completed" &&
    isPastOrEqualExperienceDate(booking.experienceDate) &&
    isWithinReviewWindow(booking.experienceDate)
  );
}

export function getExperienceId(b: Booking): string {
  if (typeof b.experience === "object" && b.experience?._id) return b.experience._id;
  return String(b.experience);
}

/** End of the 7-day review window (inclusive) as timestamp. */
export function reviewWindowEndMs(experienceDateIso?: string): number | null {
  if (!experienceDateIso) return null;
  const t = new Date(experienceDateIso).getTime();
  if (Number.isNaN(t)) return null;
  return t + REVIEW_WINDOW_DAYS * MS_PER_DAY;
}

/** Human-readable time left in the review window, or null if not applicable. */
export function formatTimeLeftInReviewWindow(experienceDateIso?: string): string | null {
  const end = reviewWindowEndMs(experienceDateIso);
  if (end === null) return null;
  const left = end - Date.now();
  if (left <= 0) return "last day to review";
  const days = Math.floor(left / MS_PER_DAY);
  const hours = Math.floor((left % MS_PER_DAY) / (60 * 60 * 1000));
  if (days >= 1) {
    return `${days} day${days === 1 ? "" : "s"} left to review`;
  }
  if (hours >= 1) {
    return `${hours} hour${hours === 1 ? "" : "s"} left to review`;
  }
  return "a few hours left to review";
}
