import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { bookingsService, type Booking } from "@/services/bookings.service";
import {
  canOfferReview,
  formatTimeLeftInReviewWindow,
  getExperienceId,
} from "@/lib/reviewEligibility";

const DISMISS_KEY_PREFIX = "endebeto_dismissReviewBanner:";

export const REVIEW_BANNER_HEIGHT_PX = 44;
export const MY_BOOKINGS_REVIEW_BANNER_QUERY_KEY = ["my-bookings", "review-banner"] as const;

function isDismissedInStorage(experienceId: string): boolean {
  try {
    return localStorage.getItem(`${DISMISS_KEY_PREFIX}${experienceId}`) === "1";
  } catch {
    return false;
  }
}

function dismissInStorage(experienceId: string) {
  try {
    localStorage.setItem(`${DISMISS_KEY_PREFIX}${experienceId}`, "1");
  } catch {
    /* ignore */
  }
}

function experienceTitleForBanner(b: Booking): string {
  const ex = b.experience;
  if (ex && typeof ex === "object" && "title" in ex) return ex.title;
  return "an experience";
}

export function ReviewPendingBanner({
  onVisibleChange,
}: {
  onVisibleChange?: (visible: boolean) => void;
}) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dismissVersion, setDismissVersion] = useState(0);

  const showAsGuest =
    isAuthenticated && !authLoading && user?.role === "user";

  const { data, isLoading } = useQuery({
    queryKey: MY_BOOKINGS_REVIEW_BANNER_QUERY_KEY,
    queryFn: async () => {
      const res = await bookingsService.getMyBookings({ page: 1, limit: 50 });
      return res.data;
    },
    enabled: showAsGuest,
    staleTime: 3 * 60 * 1000,
  });

  const pending = useMemo(() => {
    const list = data?.data ?? [];
    for (const b of list) {
      if (!canOfferReview(b)) continue;
      if (b.userHasReviewed === true) continue;
      const exId = getExperienceId(b);
      if (isDismissedInStorage(exId)) continue;
      return { booking: b, experienceId: exId };
    }
    return null;
  }, [data, dismissVersion]);

  const visible = Boolean(showAsGuest && !isLoading && pending);

  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible, onVisibleChange]);

  const handleDismiss = (experienceId: string) => {
    dismissInStorage(experienceId);
    setDismissVersion((v) => v + 1);
  };

  if (!showAsGuest || isLoading || !pending) return null;

  const timeLine = formatTimeLeftInReviewWindow(pending.booking.experienceDate);
  const title = experienceTitleForBanner(pending.booking);

  return (
    <div
      className="w-full flex items-center justify-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 text-[10px] sm:text-[11px] font-semibold leading-snug bg-amber-50/95 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 border-b border-amber-200/60 dark:border-amber-800/50"
      style={{ minHeight: REVIEW_BANNER_HEIGHT_PX }}
    >
      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
      <p className="flex-1 min-w-0 text-center sm:text-left">
        <span className="line-clamp-2">
          You can review <span className="font-bold">{title}</span>
          {timeLine ? <span> — {timeLine}.</span> : "."}{" "}
          <Link
            to="/my-bookings"
            className="underline decoration-2 underline-offset-2 font-bold text-primary dark:text-primary hover:opacity-90"
          >
            My bookings
          </Link>
        </span>
      </p>
      <button
        type="button"
        onClick={() => handleDismiss(pending.experienceId)}
        className="shrink-0 p-1.5 rounded-md text-amber-800 dark:text-amber-200 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 transition-colors"
        aria-label="Dismiss review reminder"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
