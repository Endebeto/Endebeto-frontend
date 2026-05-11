import { useEffect, useRef, useState } from "react";
import type { Review as ExperienceReview } from "@/services/experiences.service";
import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  History,
  Loader2,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { MY_BOOKINGS_REVIEW_BANNER_QUERY_KEY } from "@/components/ReviewPendingBanner";
import { bookingsService, type Booking } from "@/services/bookings.service";
import { experiencesService } from "@/services/experiences.service";
import { reviewsService } from "@/services/reviews.service";
import {
  REVIEW_WINDOW_DAYS,
  canOfferReview,
  getExperienceId,
} from "@/lib/reviewEligibility";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getFriendlyErrorMessage } from "@/lib/errors";

/** Page size for GET /bookings/me — use Load more for additional pages */
const BOOKINGS_PAGE_SIZE = 10;

function formatDate(iso?: string) {
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

function experienceTitle(b: Booking) {
  const ex = b.experience;
  if (ex && typeof ex === "object" && "title" in ex) return ex.title;
  return "Experience";
}

function isExperienceSuspended(b: Booking): boolean {
  const ex = b.experience;
  return typeof ex === "object" && ex !== null && Boolean(ex.suspended);
}

function partitionBookings(list: Booking[]) {
  const upcoming = list.filter((b) => b.status === "upcoming");
  const past = list.filter((b) =>
    ["completed", "paymentExpired", "cancelled"].includes(b.status)
  );
  return { upcoming, past };
}

function apiErrMessage(e: unknown): string {
  return getFriendlyErrorMessage(e);
}

/* ─── Chapa tx_ref handling ─────────────────────────────── */

function useVerifyTxRef() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const handledRef = useRef<string | null>(null);
  const txRefParam = searchParams.get("tx_ref");

  useEffect(() => {
    if (!txRefParam) return;
    if (handledRef.current === txRefParam) return;
    handledRef.current = txRefParam;

    const clearParam = () => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("tx_ref");
          return next;
        },
        { replace: true }
      );
    };

    (async () => {
      try {
        const { data } = await bookingsService.verifyPayment(txRefParam);
        if (data.status === "success" && data.booking) {
          toast.success("Payment confirmed — your booking is saved.");
          await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        } else if (data.status === "success" && data.message) {
          toast.message(data.message, { description: "If you already paid, check back shortly or contact support." });
        } else if (data.status === "failed") {
          toast.error(data.message ?? "Payment was not completed.");
        } else {
          toast.success("Verification finished.");
          await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        }
      } catch (e) {
        toast.error(apiErrMessage(e));
      } finally {
        clearParam();
      }
    })();
  }, [txRefParam, setSearchParams, queryClient]);
}

/* ─── Review dialog ─────────────────────────────────────── */

function ReviewExperienceDialog({
  open,
  onOpenChange,
  experienceId,
  experienceTitle: title,
  userId,
  existingReview,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  experienceId: string;
  experienceTitle: string;
  userId: string;
  existingReview?: Pick<ExperienceReview, "_id" | "review" | "rating"> | null;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const isEdit = Boolean(existingReview?._id);

  useEffect(() => {
    if (!open) return;
    if (existingReview) {
      setRating(existingReview.rating);
      setText(existingReview.review);
    } else {
      setRating(5);
      setText("");
    }
  }, [open, existingReview]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { review: text.trim(), rating };
      if (isEdit && existingReview) {
        return reviewsService.update(experienceId, existingReview._id, payload);
      }
      return reviewsService.create(experienceId, payload);
    },
    onSuccess: async () => {
      toast.success(isEdit ? "Review updated." : "Thanks for your review!");
      onOpenChange(false);
      if (!isEdit) {
        setText("");
        setRating(5);
      }
      await queryClient.invalidateQueries({ queryKey: ["experience-reviews-mine", experienceId, userId] });
      await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      await queryClient.invalidateQueries({ queryKey: [...MY_BOOKINGS_REVIEW_BANNER_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: ["experience", experienceId] });
    },
    onError: (e) => {
      toast.error(apiErrMessage(e));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit your review" : "Review experience"}</DialogTitle>
          <DialogDescription className="line-clamp-2">{title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Rating</Label>
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`h-7 w-7 ${n <= rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-text" className="text-xs">
              Your review
            </Label>
            <Textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share what you loved (or what could improve)…"
              rows={4}
              className="mt-1.5 resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending || !text.trim()}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewCell({ booking, userId, userRole }: { booking: Booking; userId?: string; userRole?: string }) {
  const [open, setOpen] = useState(false);
  const exId = getExperienceId(booking);
  const eligible = userRole === "user" && canOfferReview(booking);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["experience-reviews-mine", exId, userId],
    queryFn: async () => {
      const res = await experiencesService.getReviews(exId, { page: 1, limit: 250 });
      return res.data.data.data;
    },
    enabled: Boolean(eligible && userId),
  });

  if (!eligible || !userId) return null;

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />;
  }

  const myReview = reviews?.find((r) => r.user._id === userId);

  if (myReview) {
    return (
      <>
        <Button type="button" size="sm" variant="secondary" className="shrink-0 text-xs h-8" onClick={() => setOpen(true)}>
          Edit review
        </Button>
        <ReviewExperienceDialog
          open={open}
          onOpenChange={setOpen}
          experienceId={exId}
          experienceTitle={experienceTitle(booking)}
          userId={userId}
          existingReview={{ _id: myReview._id, review: myReview.review, rating: myReview.rating }}
        />
      </>
    );
  }

  return (
    <>
      <Button type="button" size="sm" variant="secondary" className="shrink-0 text-xs h-8" onClick={() => setOpen(true)}>
        Write review
      </Button>
      <ReviewExperienceDialog
        open={open}
        onOpenChange={setOpen}
        experienceId={exId}
        experienceTitle={experienceTitle(booking)}
        userId={userId}
        existingReview={null}
      />
    </>
  );
}

function CancelBookingDialog({
  booking,
  open,
  onClose,
}: {
  booking: Booking;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => bookingsService.cancelBooking(booking._id),
    onSuccess: () => {
      toast.success("Booking cancelled.");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      onClose();
    },
    onError: (err: unknown) => {
      const status =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status === "number"
          ? (err as { response: { status: number } }).response.status
          : 0;
      if (status === 400 || status === 403 || status === 404) {
        toast.error("This booking can't be cancelled.");
        return;
      }
      toast.error("Something went wrong. Please try again.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-base font-bold text-on-surface dark:text-white">
              Cancel this booking?
            </DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-3 pt-1">
              <p className="text-sm text-on-surface-variant dark:text-zinc-400">
                You're about to cancel your booking for:
              </p>
              <div className="p-3 bg-surface-container-low dark:bg-zinc-800 rounded-xl">
                <p className="text-sm font-semibold text-on-surface dark:text-white">
                  {experienceTitle(booking)}
                </p>
                <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5">
                  {formatDate(booking.experienceDate ?? booking.createdAt)} · {booking.quantity} guest{booking.quantity > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/50 rounded-xl">
                <XCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>This can't be undone.</strong> You won't be refunded. The host is paid for this booking. Your spot may be offered to someone else.
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1"
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Cancelling…</>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1.5" />
                Yes, Cancel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookingCard({ booking, userId, userRole }: { booking: Booking; userId?: string; userRole?: string }) {
  const [showCancel, setShowCancel] = useState(false);

  const statusStyle =
    booking.status === "upcoming"
      ? "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
      : booking.status === "completed"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-green-400"
        : booking.status === "cancelled"
          ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  const exId = getExperienceId(booking);
  const canCancel = booking.status === "upcoming";
  const suspended = isExperienceSuspended(booking);
  const showSuspensionNotice = canCancel && suspended;

  return (
    <>
      {showCancel && (
        <CancelBookingDialog
          booking={booking}
          open={showCancel}
          onClose={() => setShowCancel(false)}
        />
      )}
      <li className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 sm:p-4 bg-surface-container-low dark:bg-zinc-800 rounded-xl sm:rounded-xl border border-outline-variant/10 dark:border-zinc-700/60 hover:border-outline-variant/25 transition-colors shadow-sm">
        {showSuspensionNotice && (
          <div className="w-full order-first flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              This experience is temporarily paused by the platform. Your booking still stands unless we contact you.{" "}
              {typeof booking.experience === "object" && booking.experience.suspensionReason
                ? `Note: ${booking.experience.suspensionReason}`
                : null}
            </span>
          </div>
        )}
        <Link
          to={`/experiences/${exId}`}
          className="flex flex-1 min-w-0 items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-primary dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface dark:text-white truncate group-hover:text-primary transition-colors">
              {experienceTitle(booking)}
            </p>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400">
              {formatDate(booking.experienceDate ?? booking.createdAt)} · {booking.quantity} guest
              {booking.quantity > 1 ? "s" : ""}
              {booking.paid ? " · Paid" : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 sm:mr-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle}`}>
              {booking.status}
            </span>
            <span className="text-xs font-bold text-primary dark:text-green-400">
              ETB {typeof booking.price === "number" ? booking.price.toLocaleString() : booking.price}
            </span>
          </div>
        </Link>
        <div className="flex items-center justify-end sm:justify-center gap-2 shrink-0 border-t border-outline-variant/10 sm:border-t-0 pt-3 sm:pt-0">
          <ReviewCell booking={booking} userId={userId} userRole={userRole} />
          {canCancel && (
            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="flex items-center justify-center gap-1.5 min-h-11 min-w-[5.5rem] text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200/70 dark:border-red-800/50 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors active:scale-[0.98]"
            >
              <XCircle className="h-4 w-4 shrink-0" />
              Cancel
            </button>
          )}
        </div>
      </li>
    </>
  );
}

/* ─── page ──────────────────────────────────────────────── */

export default function MyBookings() {
  useVerifyTxRef();
  const { user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["my-bookings", "list", BOOKINGS_PAGE_SIZE],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await bookingsService.getMyBookings({
        page: pageParam,
        limit: BOOKINGS_PAGE_SIZE,
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const p = lastPage.page ?? 1;
      const pages = lastPage.pages ?? 1;
      return p < pages ? p + 1 : undefined;
    },
  });

  const bookings = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const loadedCount = bookings.length;
  const { upcoming, past } = partitionBookings(bookings);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 pb-20 max-w-3xl mx-auto px-3 sm:px-4">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 mt-5 sm:mt-6 mb-3 sm:mb-4 min-h-11 sm:min-h-0 -ml-1 px-1 rounded-lg active:bg-primary/5"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to profile
        </Link>

        <div className="bg-white dark:bg-[#2d3133] rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/10 dark:border-zinc-600/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-6">
            <div className="min-w-0">
              <h1 className="font-headline font-extrabold text-xl sm:text-2xl text-primary tracking-tight">
                My Bookings
              </h1>
              <p className="text-on-surface-variant text-sm mt-1.5 leading-snug">
                {total === 0
                  ? "You have no bookings yet."
                  : `You have ${total} booking${total === 1 ? "" : "s"}.`}
                {total > 0 && loadedCount < total && (
                  <span className="block text-[11px] mt-2 opacity-90 leading-relaxed">
                    Showing {loadedCount} of {total} — tap &quot;Load more&quot; for older bookings.
                  </span>
                )}
              </p>
            </div>
            <Link
              to="/experiences"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/25 bg-primary/5 dark:bg-primary/10 px-4 py-3 sm:py-2 text-sm font-bold text-primary hover:bg-primary/10 dark:hover:bg-primary/15 transition-colors min-h-11 sm:min-h-0 w-full sm:w-auto text-center active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4 shrink-0 opacity-80" />
              Browse experiences
            </Link>
          </div>

          {bookings.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
              {(
                [
                  ["Upcoming", upcoming.length, "text-sky-600 dark:text-sky-400", "bg-sky-50 dark:bg-sky-900/25 border-sky-200/50 dark:border-sky-800/40"],
                  ["Past", past.length, "text-zinc-700 dark:text-zinc-200", "bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/60 dark:border-zinc-600/50"],
                  ["Total", total, "text-primary dark:text-green-400", "bg-primary/5 dark:bg-primary/15 border-primary/15 dark:border-primary/25"],
                ] as const
              ).map(([label, value, color, bg]) => (
                <div
                  key={label}
                  className={`${bg} rounded-xl sm:rounded-2xl px-2 py-2.5 sm:p-3 text-center border shadow-sm`}
                >
                  <p className={`text-lg sm:text-xl font-headline font-black tabular-nums ${color}`}>{value}</p>
                  <p className="text-[9px] sm:text-[10px] text-on-surface-variant font-bold uppercase tracking-wide mt-1 leading-tight">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-16 text-on-surface-variant">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {isError && (
            <p className="text-red-600 text-sm py-8 text-center">
              {getFriendlyErrorMessage(error, "Could not load bookings.")}
            </p>
          )}

          {!isLoading && !isError && bookings.length === 0 && (
            <div className="text-center py-14 sm:py-12 px-2 text-on-surface-variant">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 dark:bg-primary/15">
                <BookOpen className="h-8 w-8 text-primary opacity-70" />
              </div>
              <p className="font-headline font-bold text-base text-on-surface dark:text-white">No bookings yet</p>
              <p className="text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                When you book an experience, it will show up here with upcoming and past views.
              </p>
            </div>
          )}

          {!isLoading && !isError && bookings.length > 0 && (
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList
                className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border border-outline-variant/20 bg-surface-container-low/90 p-1 shadow-inner dark:border-zinc-600/50 dark:bg-zinc-900/60"
                aria-label="Booking timeframe"
              >
                <TabsTrigger
                  value="upcoming"
                  className="touch-manipulation relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2.5 text-muted-foreground transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-md dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-sky-300 sm:min-h-[48px] sm:flex-row sm:gap-2 sm:py-3"
                >
                  <CalendarDays className="h-5 w-5 shrink-0 opacity-90 sm:h-4 sm:w-4" aria-hidden />
                  <span className="font-headline text-[13px] font-bold leading-tight sm:text-sm">
                    Upcoming
                  </span>
                  <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-sky-700 dark:text-sky-300 data-[state=active]:bg-sky-500/25 dark:data-[state=active]:bg-sky-400/20">
                    {upcoming.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="touch-manipulation relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2.5 text-muted-foreground transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-zinc-100 sm:min-h-[48px] sm:flex-row sm:gap-2 sm:py-3"
                >
                  <History className="h-5 w-5 shrink-0 opacity-90 sm:h-4 sm:w-4" aria-hidden />
                  <span className="font-headline text-[13px] font-bold leading-tight sm:text-sm">
                    Past
                  </span>
                  <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-zinc-600 dark:text-zinc-300 data-[state=active]:bg-zinc-500/15 dark:data-[state=active]:bg-zinc-500/25">
                    {past.length}
                  </span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-4 outline-none sm:mt-5">
                {upcoming.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-outline-variant/35 bg-surface-container-low/40 px-4 py-12 text-center dark:border-zinc-600/40 dark:bg-zinc-900/30">
                    <CalendarDays className="mx-auto mb-3 h-10 w-10 text-sky-500/70 dark:text-sky-400/70" />
                    <p className="font-headline text-sm font-bold text-on-surface dark:text-white">
                      Nothing upcoming
                    </p>
                    <p className="mt-1.5 text-xs text-on-surface-variant max-w-[260px] mx-auto leading-relaxed">
                      Your confirmed bookings will appear here before the experience date.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {upcoming.map((b) => (
                      <BookingCard
                        key={b._id}
                        booking={b}
                        userId={user?._id}
                        userRole={user?.role}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="past" className="mt-4 outline-none sm:mt-5">
                {past.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-outline-variant/35 bg-surface-container-low/40 px-4 py-12 text-center dark:border-zinc-600/40 dark:bg-zinc-900/30">
                    <History className="mx-auto mb-3 h-10 w-10 text-zinc-400 dark:text-zinc-500" />
                    <p className="font-headline text-sm font-bold text-on-surface dark:text-white">
                      No past bookings yet
                    </p>
                    <p className="mt-1.5 text-xs text-on-surface-variant max-w-[260px] mx-auto leading-relaxed">
                      Completed, cancelled, or expired payments show here after they leave Upcoming.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {past.map((b) => (
                      <BookingCard
                        key={b._id}
                        booking={b}
                        userId={user?._id}
                        userRole={user?.role}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          )}

          {!isLoading && !isError && bookings.length > 0 && hasNextPage && (
            <div className="mt-6 flex flex-col items-center gap-2 px-1">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full max-w-sm sm:min-w-[220px] sm:w-auto rounded-xl font-bold"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  `Load more (${loadedCount} / ${total})`
                )}
              </Button>
            </div>
          )}

          {!isLoading && !isError && bookings.length > 0 && user?.role === "user" && (
            <p className="text-[11px] text-on-surface-variant mt-6 leading-relaxed border-t border-outline-variant/10 pt-4">
              After your experience, you can leave a review within {REVIEW_WINDOW_DAYS} days from this page.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
