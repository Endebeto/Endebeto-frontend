import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Star,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { bookingsService, type Booking } from "@/services/bookings.service";
import { experiencesService } from "@/services/experiences.service";
import { reviewsService } from "@/services/reviews.service";
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

const REVIEW_WINDOW_DAYS = 7;
/** Page size for GET /bookings/me — use Load more for additional pages */
const BOOKINGS_PAGE_SIZE = 20;

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

function getExperienceId(b: Booking): string {
  if (typeof b.experience === "object" && b.experience?._id) return b.experience._id;
  return String(b.experience);
}

function isPastOrEqualExperienceDate(iso?: string): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t <= Date.now();
}

function isWithinReviewWindow(experienceDateIso?: string): boolean {
  if (!experienceDateIso) return false;
  const t = new Date(experienceDateIso).getTime();
  if (Number.isNaN(t)) return false;
  const deadline = t + REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() <= deadline;
}

/** Matches backend `validateBookingForReview` intent: completed, paid, date passed, within window. */
function canOfferReview(booking: Booking): boolean {
  return (
    booking.paid &&
    booking.status === "completed" &&
    isPastOrEqualExperienceDate(booking.experienceDate) &&
    isWithinReviewWindow(booking.experienceDate)
  );
}

function partitionBookings(list: Booking[]) {
  const upcoming = list.filter((b) => b.status === "upcoming");
  const past = list.filter((b) =>
    ["completed", "expired", "cancelled"].includes(b.status)
  );
  return { upcoming, past };
}

function apiErrMessage(e: unknown): string {
  if (typeof e === "object" && e !== null && "response" in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response;
    if (r?.data?.message && typeof r.data.message === "string") return r.data.message;
  }
  if (e instanceof Error) return e.message;
  return "Something went wrong";
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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  experienceId: string;
  experienceTitle: string;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      reviewsService.create(experienceId, { review: text.trim(), rating }),
    onSuccess: async () => {
      toast.success("Thanks for your review!");
      onOpenChange(false);
      setText("");
      setRating(5);
      await queryClient.invalidateQueries({ queryKey: ["experience-reviews-mine", experienceId, userId] });
      await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
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
          <DialogTitle>Review experience</DialogTitle>
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
            Submit review
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

  const hasReview = reviews?.some((r) => r.user._id === userId);
  if (hasReview) {
    return (
      <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
        Review submitted
      </span>
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
      toast.success("Booking cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to cancel booking. Please try again.";
      toast.error(msg);
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
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/50 rounded-xl">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                  <strong>This action cannot be undone.</strong> No refund is provided for cancelled bookings. Please review our cancellation policy before proceeding.
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
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        : booking.status === "cancelled"
          ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  const exId = getExperienceId(booking);
  const canCancel = booking.status === "upcoming";

  return (
    <>
      {showCancel && (
        <CancelBookingDialog
          booking={booking}
          open={showCancel}
          onClose={() => setShowCancel(false)}
        />
      )}
      <li className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-surface-container-low dark:bg-zinc-800 rounded-xl border border-transparent hover:border-outline-variant/20 transition-colors">
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
        <div className="flex items-center justify-end sm:justify-center gap-2 shrink-0 border-t border-outline-variant/10 sm:border-t-0 pt-2 sm:pt-0">
          <ReviewCell booking={booking} userId={userId} userRole={userRole} />
          {canCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200/70 dark:border-red-800/50 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
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
      <main className="pt-14 pb-16 max-w-3xl mx-auto px-4">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 mt-6 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-headline font-extrabold text-2xl text-primary">My Bookings</h1>
              <p className="text-on-surface-variant text-sm mt-1">
                {total === 0
                  ? "You have no bookings yet."
                  : `You have ${total} booking${total === 1 ? "" : "s"}.`}
                {total > 0 && loadedCount < total && (
                  <span className="block text-[11px] mt-1 opacity-90">
                    Showing {loadedCount} of {total} — use &quot;Load more&quot; for older bookings.
                  </span>
                )}
              </p>
            </div>
            <Link
              to="/experiences"
              className="shrink-0 text-sm font-bold text-primary hover:underline"
            >
              Browse experiences
            </Link>
          </div>

          {bookings.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 text-center">
              {(
                [
                  ["Upcoming", upcoming.length, "text-sky-600 dark:text-sky-400", "bg-sky-50 dark:bg-sky-900/20"],
                  ["Past", past.length, "text-zinc-600 dark:text-zinc-300", "bg-zinc-100 dark:bg-zinc-800"],
                  ["Total", total, "text-primary dark:text-green-400", "bg-primary/5 dark:bg-primary/10"],
                ] as const
              ).map(([label, value, color, bg]) => (
                <div key={label} className={`${bg} rounded-xl p-3 col-span-1`}>
                  <p className={`text-xl font-headline font-black ${color}`}>{value}</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">{label}</p>
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
              {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Could not load bookings."}
            </p>
          )}

          {!isLoading && !isError && bookings.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-on-surface">No bookings yet</p>
              <p className="text-sm mt-1">Book an experience to see it here.</p>
            </div>
          )}

          {!isLoading && !isError && bookings.length > 0 && (
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 h-auto p-1 bg-muted/60">
                <TabsTrigger value="upcoming" className="text-xs sm:text-sm py-2.5">
                  Upcoming ({upcoming.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="text-xs sm:text-sm py-2.5">
                  Past ({past.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-0 outline-none">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-10">No upcoming bookings.</p>
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
              <TabsContent value="past" className="mt-0 outline-none">
                {past.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-10">No past bookings yet.</p>
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
            <div className="mt-6 flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-w-[200px]"
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
              {loadedCount < total && (
                <p className="text-[10px] text-on-surface-variant text-center max-w-sm">
                  Upcoming / Past counts include every booking loaded above, not only the current tab.
                </p>
              )}
            </div>
          )}

          {!isLoading && !isError && bookings.length > 0 && user?.role === "user" && (
            <p className="text-[11px] text-on-surface-variant mt-6 leading-relaxed border-t border-outline-variant/10 pt-4">
              <strong>Reviews:</strong> After a completed experience, you can leave a review within {REVIEW_WINDOW_DAYS}{" "}
              days (same rule as the server). Only travelers with role <code className="text-[10px]">user</code> can post
              reviews.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
