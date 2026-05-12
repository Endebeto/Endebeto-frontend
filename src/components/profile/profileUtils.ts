import { getFriendlyErrorMessage } from "@/lib/errors";
import type { Booking } from "@/services/bookings.service";

export type ProfileTab = "personal" | "security" | "notifications" | "bookings";

export function profileApiErrMessage(e: unknown): string {
  return getFriendlyErrorMessage(e);
}

export function formatBookingDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function bookingExperienceTitle(b: Booking) {
  const ex = b.experience;
  if (ex && typeof ex === "object" && "title" in ex) return ex.title;
  return "Experience";
}

export const PROFILE_NAV_META: { id: ProfileTab; label: string }[] = [
  { id: "personal", label: "Personal Info" },
  { id: "bookings", label: "My Bookings" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
];
