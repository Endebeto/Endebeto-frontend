import { getFriendlyErrorMessage } from "@/lib/errors";
import { type Booking } from "@/services/bookings.service";

export const REVIEWS_PER_PAGE = 3;

export function apiErrMessage(e: unknown): string {
  return getFriendlyErrorMessage(e, "Could not start payment. Try again.");
}

export function bookingExperienceId(b: Booking): string {
  if (typeof b.experience === "object" && b.experience?._id) {
    return String(b.experience._id);
  }
  return String(b.experience);
}
