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

/**
 * Strips raw SMTP/MIME technical email headers that may have been saved during
 * automated tests or mock mail dumps (e.g., From:, To:, Message-ID:, MIME-Version:).
 */
export function sanitizeAnnouncementMessage(rawMessage?: string): string {
  if (!rawMessage) return "";
  const lines = rawMessage.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    return !/^(From|To|Cc|Bcc|Subject|Message-ID|Date|MIME-Version|Content-Type|Content-Transfer-Encoding|Reply-To):\s*/i.test(
      trimmed
    );
  });

  const cleaned = filtered.join("\n").trim();
  if (!cleaned) {
    return "The host has posted an update for guests attending upcoming sessions.";
  }
  return cleaned;
}

/**
 * Normalizes subject line so raw local URLs are replaced with a clear title.
 */
export function normalizeAnnouncementSubject(rawSubject?: string): string {
  if (!rawSubject) return "Host Announcement";
  const trimmed = rawSubject.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return "Host Note for Upcoming Sessions";
  }
  return trimmed;
}
