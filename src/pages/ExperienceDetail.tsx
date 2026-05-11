import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MapPin, Star, Clock, Users, Globe,
  AlertCircle, ArrowRight, ChevronLeft, ExternalLink, X,
  Share2, Link2, Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UserAvatar } from "@/components/UserAvatar";
import {
  buildGalleryUrls,
  getGalleryPreviewSlots,
  GalleryMoreOverlay,
  GalleryLightbox,
} from "@/components/experience/ExperienceGallery";
import { ContactHostButton } from "@/components/experience/ContactHostButton";
import { fmtDate, fmtTime, ReviewCard } from "@/components/experience/ExperienceReviewCard";
import { ExperienceDetailSkeleton } from "@/components/experience/ExperienceDetailSkeleton";
import { ExperienceDescriptionMarkdown } from "@/components/ExperienceDescriptionMarkdown";
import { experiencesService, type Review } from "@/services/experiences.service";
import { bookingsService, type Booking } from "@/services/bookings.service";
import { useAuth } from "@/context/AuthContext";
import { getFriendlyErrorMessage } from "@/lib/errors";

function apiErrMessage(e: unknown): string {
  return getFriendlyErrorMessage(e, "Could not start payment. Try again.");
}

function bookingExperienceId(b: Booking): string {
  if (typeof b.experience === "object" && b.experience?._id) return String(b.experience._id);
  return String(b.experience);
}

const REVIEWS_PER_PAGE = 3;

/** Lightweight map look for guests who have not booked: one static image (no iframe/JS) or a CSS grid fallback. */
function UnbookedMapPlaceholder({
  mapImageUrl,
  children,
}: {
  mapImageUrl: string | null;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full w-full">
      {mapImageUrl ? (
        <img
          src={mapImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px] opacity-90 dark:opacity-80"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(90deg, rgba(100, 116, 139, 0.09) 0 1px, transparent 1px 20px),
              repeating-linear-gradient(0deg, rgba(100, 116, 139, 0.09) 0 1px, transparent 1px 20px),
              linear-gradient(155deg, rgb(207 250 254 / 0.9) 0%, rgb(209 250 229 / 0.85) 38%, rgb(231 229 228 / 0.95) 100%)
            `,
          }}
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-background/88 via-background/40 to-transparent dark:from-zinc-950/92 dark:via-zinc-950/45"
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6">{children}</div>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */

const ExperienceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: myBookingsPayload } = useQuery({
    queryKey: ["my-bookings", "experience-detail", id],
    queryFn: async () => {
      const res = await bookingsService.getMyBookings({ page: 1, limit: 100 });
      return res.data.data;
    },
    enabled: !!id && isAuthenticated,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["experience", id],
    queryFn: () => experiencesService.getOne(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

  const expForAvail = data?.data?.data?.data;

  const { data: availPayload } = useQuery({
    queryKey: ["booking-availability", id],
    queryFn: async () => {
      const res = await bookingsService.getAvailability(id!);
      return res.data.data;
    },
    enabled: Boolean(id && expForAvail),
    staleTime: 30_000,
  });

  const maxBookable = useMemo(() => {
    if (!expForAvail) return 1;
    const cap = Math.min(
      expForAvail.maxGuests,
      availPayload?.available ?? expForAvail.maxGuests
    );
    return Math.max(0, cap);
  }, [expForAvail, availPayload?.available]);

  const hasUpcomingBookingHere = useMemo(() => {
    if (!isAuthenticated || !id) return false;
    const list = myBookingsPayload ?? [];
    return list.some(
      (b) => bookingExperienceId(b) === id && b.status === "upcoming"
    );
  }, [isAuthenticated, id, myBookingsPayload]);

  /** Mobile: open sheet to confirm guests, then pay. Desktop: pay uses sidebar guest count directly. */
  const openMobileBookingSheet = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/experiences/${id}` } });
      return;
    }
    if (hasUpcomingBookingHere) return;
    setShowBookingModal(true);
  };

  useEffect(() => {
    if (hasUpcomingBookingHere && showBookingModal) setShowBookingModal(false);
  }, [hasUpcomingBookingHere, showBookingModal]);

  useEffect(() => {
    setGuests((g) => {
      if (maxBookable === 0) return 0;
      return Math.min(Math.max(1, g), maxBookable);
    });
  }, [maxBookable]);

  /** Chapa: GET /bookings/checkout-session/:experienceId → redirect to checkout_url; return lands on /my-bookings?tx_ref= (Phase 5). */
  const startCheckout = useCallback(async () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/experiences/${id}` } });
      return;
    }
    if (hasUpcomingBookingHere) {
      toast.info("You already have an upcoming booking for this experience.");
      return;
    }
    if (maxBookable === 0) {
      toast.error("No spots available for the next date.");
      return;
    }
    if (guests < 1 || guests > maxBookable) {
      toast.error("Choose a valid number of guests for the remaining spots.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await bookingsService.getCheckoutSession(id, guests);
      const url = res.data.checkout_url;
      if (!url) {
        toast.error("Payment link was not returned. Please try again.");
        return;
      }
      window.location.assign(url);
    } catch (e) {
      toast.error(apiErrMessage(e));
    } finally {
      setCheckoutLoading(false);
    }
  }, [id, isAuthenticated, guests, navigate, hasUpcomingBookingHere, maxBookable]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /* ─── paginated reviews ── */
  const [reviewPage, setReviewPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReviewPage(1);
    setReviews([]);
  }, [id]);

  const { data: reviewsData, isFetching: reviewsFetching } = useQuery({
    queryKey: ["reviews", id, reviewPage],
    queryFn: () => experiencesService.getReviews(id!, { page: reviewPage, limit: REVIEWS_PER_PAGE }),
    enabled: !!id,
    staleTime: 60_000,
  });

  // Append newly fetched page to the accumulated list
  useEffect(() => {
    const incoming = reviewsData?.data.data.data;
    if (!incoming) return;
    setReviews((prev) =>
      reviewPage === 1 ? incoming : [...prev, ...incoming]
    );
  }, [reviewsData, reviewPage]);

  const totalReviews = reviewsData?.data.results ?? 0;
  const hasMore = reviews.length < totalReviews;

  const exp = data?.data.data.data;

  /** Defer heavy Google Maps embed until the map block is near the viewport (booked users only). */
  const mobileMapMountRef = useRef<HTMLDivElement>(null);
  const desktopMapMountRef = useRef<HTMLDivElement>(null);
  const [loadMapEmbeds, setLoadMapEmbeds] = useState(false);

  useEffect(() => {
    setLoadMapEmbeds(false);
  }, [id]);

  useEffect(() => {
    if (!hasUpcomingBookingHere || loadMapEmbeds || isLoading) return;
    const nodes = [mobileMapMountRef.current, desktopMapMountRef.current].filter(
      (n): n is HTMLDivElement => n !== null
    );
    if (nodes.length === 0) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLoadMapEmbeds(true);
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );
    nodes.forEach((n) => ob.observe(n));
    return () => ob.disconnect();
  }, [hasUpcomingBookingHere, loadMapEmbeds, exp?._id, isLoading]);

  const allGalleryImages = useMemo(
    () => (exp ? buildGalleryUrls(exp.imageCover, exp.images) : []),
    [exp]
  );
  const galleryPreviewSlots = useMemo(
    () => getGalleryPreviewSlots(allGalleryImages),
    [allGalleryImages]
  );
  const occurrenceDate = useMemo(() => fmtDate(exp?.nextOccurrenceAt), [exp?.nextOccurrenceAt]);
  const occurrenceTime = useMemo(() => fmtTime(exp?.nextOccurrenceAt), [exp?.nextOccurrenceAt]);

  const mapsSearchHref = useMemo(() => {
    if (!exp) return "#";
    // Public page: avoid linking precise coordinates before the guest has booked.
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.location)}`;
  }, [exp]);

  /** Single static map image when coords exist; no iframe (see UnbookedMapPlaceholder). */
  const unbookedApproxMapImageUrl = useMemo(() => {
    if (!exp || exp.latitude == null || exp.longitude == null) return null;
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${exp.latitude},${exp.longitude}&zoom=10&size=800x320&maptype=mapnik`;
  }, [exp]);

  const handleCopyPublicLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  }, []);

  const handleShareExperience = useCallback(async () => {
    const title = exp?.title ?? "Endebeto experience";
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        await handleCopyPublicLink();
      }
    } else {
      await handleCopyPublicLink();
    }
  }, [exp?.title, handleCopyPublicLink]);

  if (isLoading) return <ExperienceDetailSkeleton />;

  if (isError || !exp) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-headline text-2xl font-bold text-primary">Experience not found</h1>
          <Link to="/experiences" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Experiences
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const totalBase = exp.price * guests;

  return (
    <div className="min-h-screen bg-background">
      {lightboxIndex !== null && allGalleryImages.length > 0 && (
        <GalleryLightbox
          images={allGalleryImages}
          index={lightboxIndex}
          title={exp.title}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT  (hidden on lg+)
      ══════════════════════════════════════════ */}
      <div className="lg:hidden">

        {/* ── Full-bleed hero ── */}
        <div className="relative h-[52vh] w-full overflow-hidden">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute inset-0 block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset"
            aria-label="View cover photo full screen"
          >
            <img src={exp.imageCover} alt={exp.title} className="w-full h-full object-cover pointer-events-none" />
          </button>

          {/* Floating nav buttons — higher on screen, high-contrast on photos */}
          <div
            className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 z-20"
            style={{ paddingTop: "max(0.25rem, env(safe-area-inset-top, 0px) + 0.25rem)" }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-lg text-zinc-900"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleCopyPublicLink()}
                className="w-10 h-10 rounded-full bg-primary text-white border border-white/30 flex items-center justify-center shadow-lg"
                aria-label="Copy public experience link"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void handleShareExperience()}
                className="w-10 h-10 rounded-full bg-primary text-white border border-white/30 flex items-center justify-center shadow-lg"
                aria-label="Share experience"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {exp.ratingsAverage >= 4.9 && (
            <span className="absolute bottom-16 left-4 z-10 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Top Rated
            </span>
          )}
        </div>

        {/* ── White content card slides up over hero ── */}
        <div className="relative -mt-8 bg-white dark:bg-zinc-950 rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] pb-28">

          <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mt-3 mb-4" />

          <div className="px-5">

            <h1 className="font-headline font-extrabold text-2xl text-on-surface dark:text-white leading-tight mb-2">
              {exp.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                {exp.location}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
              {exp.ratingsAverage !== null && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <strong className="text-on-surface dark:text-white">{exp.ratingsAverage.toFixed(1)}</strong>
                  <span>({exp.ratingsQuantity} reviews)</span>
                </span>
              )}
            </div>

            {/* Host row */}
            <div className="flex items-center justify-between py-4 mt-3 border-t border-b border-outline-variant/15 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={exp.host?.name}
                  photo={exp.host?.photo}
                  className="w-10 h-10 rounded-full bg-secondary-container shrink-0 ring-2 ring-white dark:ring-zinc-900"
                  initialsClassName="text-on-secondary-container text-sm"
                />
                <div>
                  <p className="text-[10px] text-on-surface-variant dark:text-zinc-500 uppercase tracking-wider">Hosted by</p>
                  <p className="font-headline font-bold text-sm text-on-surface dark:text-white">{exp.host?.name}</p>
                </div>
              </div>
              <ContactHostButton
                host={exp.host}
                experienceTitle={exp.title}
                booked={hasUpcomingBookingHere}
                compact
              />
            </div>

            {exp.host?.hostStory?.trim() && (
              <div className="mb-4 rounded-xl bg-surface-container-low/80 dark:bg-zinc-900/60 border border-outline-variant/15 dark:border-zinc-800 px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-500 mb-1.5">
                  From the host
                </p>
                <p className="text-xs text-on-surface dark:text-zinc-200 leading-relaxed italic">
                  &ldquo;{exp.host.hostStory.trim()}&rdquo;
                </p>
              </div>
            )}

            {/* Gallery strip — max 4 previews; last shows +N to open lightbox for the rest */}
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-5 px-5 py-4">
              {galleryPreviewSlots.map(({ imageIndex, src, moreCount }) => (
                <button
                  key={`${src}-${imageIndex}`}
                  type="button"
                  onClick={() => setLightboxIndex(imageIndex)}
                  className="relative h-28 w-36 rounded-2xl overflow-hidden shrink-0 shadow-sm ring-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={
                    moreCount > 0
                      ? `Open gallery — ${moreCount} more photos`
                      : `View photo ${imageIndex + 1} of ${allGalleryImages.length}`
                  }
                >
                  <img src={src} alt="" className="w-full h-full object-cover pointer-events-none" />
                  <GalleryMoreOverlay moreCount={moreCount} compact />
                </button>
              ))}
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 pb-5 border-b border-outline-variant/15 dark:border-zinc-800">
              {[
                { icon: Clock,  label: "DURATION",   value: exp.duration },
                { icon: Users,  label: "GROUP SIZE",  value: `Up to ${exp.maxGuests}` },
                { icon: Globe,  label: "LANGUAGES",   value: "English, Amharic" },
                { icon: Star,   label: "RATING",      value: exp.ratingsAverage !== null ? `${exp.ratingsAverage.toFixed(1)} / 5.0` : 'New' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5 py-2">
                  <Icon className="h-4 w-4 text-on-surface-variant dark:text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-500">{label}</p>
                    <p className="font-headline font-bold text-sm text-on-surface dark:text-white mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="py-5 border-b border-outline-variant/15 dark:border-zinc-800">
              <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white mb-3">About this Experience</h2>
              <ExperienceDescriptionMarkdown
                markdown={exp.description}
                className="text-xs [&_p]:text-xs [&_li]:text-xs [&_ul]:text-xs [&_ol]:text-xs"
              />
            </div>

            {/* Location */}
            <div className="py-5 border-b border-outline-variant/15 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white">Where you'll meet</h2>
                {hasUpcomingBookingHere && (
                  <a
                    href={exp.latitude && exp.longitude
                      ? `https://www.google.com/maps/dir/?api=1&destination=${exp.latitude},${exp.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.location)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-bold text-primary dark:text-green-400 flex items-center gap-1"
                  >
                    Open Maps <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-3 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                {hasUpcomingBookingHere ? (exp.address || exp.location) : exp.location}
                {!hasUpcomingBookingHere && <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">· Exact meetup point shared after booking</span>}
              </p>
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container">
                {hasUpcomingBookingHere ? (
                  <div ref={mobileMapMountRef} className="relative h-full w-full">
                    {loadMapEmbeds ? (
                      <iframe
                        title={`Meetup point for ${exp.title}`}
                        className="h-full w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={
                          exp.latitude && exp.longitude
                            ? `https://maps.google.com/maps?q=${exp.latitude},${exp.longitude}&output=embed&z=17`
                            : `https://maps.google.com/maps?q=${encodeURIComponent(exp.location)}&output=embed&z=15`
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-container">
                        <MapPin className="h-9 w-9 text-outline-variant/45" aria-hidden />
                      </div>
                    )}
                  </div>
                ) : (
                  <UnbookedMapPlaceholder mapImageUrl={unbookedApproxMapImageUrl}>
                    <div className="rounded-xl border border-outline-variant/20 bg-white px-4 py-3 text-center shadow-lg dark:bg-zinc-900">
                      <MapPin className="mx-auto mb-1 h-5 w-5 text-primary" />
                      <p className="text-xs font-bold text-on-surface dark:text-white">Exact meetup point shared after booking</p>
                      <p className="mt-0.5 text-[10px] text-on-surface-variant dark:text-zinc-400">
                        Book this experience to see the precise location
                      </p>
                      <a
                        href={mapsSearchHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary dark:text-green-400"
                      >
                        Open approximate area <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </UnbookedMapPlaceholder>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="py-5">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white">Guest Reviews</h2>
                {exp.ratingsAverage !== null && (
                  <span className="text-xs text-on-surface-variant dark:text-zinc-400 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <strong className="text-on-surface dark:text-white">{exp.ratingsAverage.toFixed(1)}</strong> · {exp.ratingsQuantity}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {reviews.length > 0
                  ? reviews.map((r, i) => <ReviewCard key={r._id} review={r} index={i} />)
                  : !reviewsFetching && <p className="text-xs text-on-surface-variant">No reviews yet. Be the first!</p>
                }
                {reviewsFetching && (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              {!reviewsFetching && (reviews.length > REVIEWS_PER_PAGE || hasMore) && (
                <div className="mt-4 flex items-center gap-4">
                  {hasMore && (
                    <button
                      onClick={() => setReviewPage((p) => p + 1)}
                      className="text-xs font-bold text-primary dark:text-green-400 flex items-center gap-1 hover:translate-x-1 transition-transform"
                    >
                      Show more ({reviews.length}/{totalReviews})
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {reviews.length > REVIEWS_PER_PAGE && (
                    <button
                      onClick={() => setReviewPage(1)}
                      className="text-xs font-semibold text-on-surface-variant hover:text-primary dark:hover:text-green-400 transition-colors"
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile sticky bottom bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-outline-variant/20 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div>
            <p className="text-[10px] text-on-surface-variant dark:text-zinc-500">Price per guest</p>
            <p className="font-headline font-extrabold text-lg text-primary dark:text-green-400 leading-tight">
              {exp.price.toLocaleString()} ETB
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-1 flex-1 max-w-[200px]">
            <button
              type="button"
              disabled={hasUpcomingBookingHere || maxBookable === 0}
              onClick={openMobileBookingSheet}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {hasUpcomingBookingHere ? "Already booked" : maxBookable === 0 ? "Sold out" : "Book Now"}
            </button>
            {hasUpcomingBookingHere && (
              <Link
                to="/my-bookings"
                className="text-center text-[10px] font-bold text-primary dark:text-green-400 hover:underline"
              >
                View in My Bookings
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT  (hidden on mobile)
      ══════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <Navbar />

        {/* Hero */}
        <section className="relative h-[420px] w-full overflow-hidden">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute inset-0 block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset z-0"
            aria-label="View cover photo full screen"
          >
            <img src={exp.imageCover} alt={exp.title} className="w-full h-full object-cover pointer-events-none" />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none z-[1]" />
          <div className="absolute bottom-0 left-0 w-full px-6 pb-8 z-[2] pointer-events-none">
            <div className="max-w-7xl mx-auto">
              {exp.ratingsAverage >= 4.9 && (
                <span className="inline-block bg-tertiary-container text-on-tertiary-container px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                  Top Rated
                </span>
              )}
              <h1
                className="text-white font-headline font-extrabold text-4xl max-w-2xl leading-snug"
                style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)" }}
              >
                {exp.title}
              </h1>
              <div
                className="flex items-center gap-4 mt-3 text-white text-sm"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
              >
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 fill-current text-on-tertiary-container" />{exp.location}</span>
                {exp.ratingsAverage !== null && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-current text-on-tertiary-container" />
                      <strong>{exp.ratingsAverage.toFixed(1)}</strong>
                      <span className="opacity-80">({exp.ratingsQuantity} reviews)</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery — max 4 previews; 4th tile +N opens lightbox (browse all there) */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {galleryPreviewSlots.map(({ imageIndex, src, moreCount }) => (
              <button
                key={`${src}-${imageIndex}`}
                type="button"
                onClick={() => setLightboxIndex(imageIndex)}
                className="h-36 rounded-xl overflow-hidden shadow-lg ring-2 ring-white relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={
                  moreCount > 0
                    ? `Open gallery — ${moreCount} more photos`
                    : `View photo ${imageIndex + 1} of ${allGalleryImages.length}`
                }
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 pointer-events-none"
                />
                <GalleryMoreOverlay moreCount={moreCount} />
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-3 gap-10">
          <div className="col-span-2 space-y-8">

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleCopyPublicLink()}
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-xs font-bold text-primary hover:bg-surface-container transition-colors"
              >
                <Link2 className="h-4 w-4" /> Copy link
              </button>
              <button
                type="button"
                onClick={() => void handleShareExperience()}
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-xs font-bold text-primary hover:bg-surface-container transition-colors"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
              <p className="text-[11px] text-on-surface-variant max-w-md">
                Only share the public experience link.
              </p>
            </div>

            {/* Host card */}
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={exp.host?.name}
                  photo={exp.host?.photo}
                  className="w-10 h-10 rounded-full bg-secondary-container shrink-0"
                  initialsClassName="text-on-secondary-container text-sm"
                />
                <div>
                  <p className="text-on-surface-variant text-xs">Hosted by</p>
                  <p className="font-headline font-bold text-primary">{exp.host?.name}</p>
                </div>
              </div>
              <ContactHostButton
                host={exp.host}
                experienceTitle={exp.title}
                booked={hasUpcomingBookingHere}
              />
            </div>

            {exp.host?.hostStory?.trim() && (
              <div className="rounded-xl bg-surface-container-low p-5 border border-outline-variant/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  From the host
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed italic">
                  &ldquo;{exp.host.hostStory.trim()}&rdquo;
                </p>
              </div>
            )}

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Clock,  label: "Duration",   value: exp.duration },
                { icon: Users,  label: "Max Guests",  value: `Up to ${exp.maxGuests}` },
                { icon: Globe,  label: "Languages",   value: "English, Amharic" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white dark:bg-[#2d3133] p-4 rounded-xl shadow-sm">
                  <Icon className="h-4 w-4 text-primary mb-1.5" />
                  <p className="text-xs text-on-surface-variant">{label}</p>
                  <p className="font-headline font-bold text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* About */}
            <div>
              <h2 className="font-headline font-extrabold text-lg text-primary mb-3">About this Experience</h2>
              <div className="space-y-3 text-on-surface-variant text-sm leading-relaxed">
                <ExperienceDescriptionMarkdown markdown={exp.description} />
                {exp.summary && exp.summary !== exp.description && (
                  <p className="text-xs italic opacity-80">{exp.summary}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="pt-6 border-t border-outline-variant/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-extrabold text-lg text-primary flex items-center gap-2"><MapPin className="h-5 w-5" />Where you'll meet</h2>
                {hasUpcomingBookingHere && (
                  <a
                    href={exp.latitude && exp.longitude
                      ? `https://www.google.com/maps/dir/?api=1&destination=${exp.latitude},${exp.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.location)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="h-3.5 w-3.5 text-primary" /></div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">
                    {hasUpcomingBookingHere ? (exp.address || exp.location) : exp.location}
                  </p>
                  {hasUpcomingBookingHere ? (
                    <p className="text-xs text-primary dark:text-green-400 font-medium">You're booked — exact meetup point unlocked</p>
                  ) : (
                    <p className="text-xs text-on-surface-variant">Exact meetup point shared after booking</p>
                  )}
                </div>
              </div>
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm bg-surface-container">
                {hasUpcomingBookingHere ? (
                  <div ref={desktopMapMountRef} className="relative h-full w-full">
                    {loadMapEmbeds ? (
                      <>
                        <iframe
                          title={`Meetup point for ${exp.title}`}
                          className="h-full w-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={
                            exp.latitude && exp.longitude
                              ? `https://maps.google.com/maps?q=${exp.latitude},${exp.longitude}&output=embed&z=17`
                              : `https://maps.google.com/maps?q=${encodeURIComponent(exp.location)}&output=embed&z=15`
                          }
                        />
                        <a
                          href={
                            exp.latitude && exp.longitude
                              ? `https://www.google.com/maps/dir/?api=1&destination=${exp.latitude},${exp.longitude}`
                              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(exp.location)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-outline-variant/20 bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-md dark:bg-zinc-800"
                        >
                          <MapPin className="h-3 w-3" /> Get Directions
                        </a>
                      </>
                    ) : (
                      <div className="flex h-64 w-full items-center justify-center bg-surface-container">
                        <MapPin className="h-10 w-10 text-outline-variant/45" aria-hidden />
                      </div>
                    )}
                  </div>
                ) : (
                  <UnbookedMapPlaceholder mapImageUrl={unbookedApproxMapImageUrl}>
                    <div className="max-w-xs rounded-2xl border border-outline-variant/20 bg-white px-6 py-5 text-center shadow-xl dark:bg-zinc-900">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <p className="mb-1 font-headline text-sm font-bold text-on-surface dark:text-white">
                        Exact meetup point shared after booking
                      </p>
                      <p className="text-[11px] text-on-surface-variant dark:text-zinc-400">
                        The precise pin drops as soon as your booking is confirmed.
                      </p>
                      <a
                        href={mapsSearchHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        Open approximate area in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </UnbookedMapPlaceholder>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="pt-6 border-t border-outline-variant/20">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-headline font-extrabold text-lg text-primary">Guest Reviews</h2>
                {exp.ratingsAverage !== null && (
                  <span className="flex items-center gap-1 text-sm text-on-surface-variant">
                    <Star className="h-3.5 w-3.5 fill-current text-on-tertiary-container" />
                    <strong className="text-foreground">{exp.ratingsAverage.toFixed(1)}</strong> · {exp.ratingsQuantity} reviews
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {reviews.length > 0
                  ? reviews.map((r, i) => <ReviewCard key={r._id} review={r} index={i} />)
                  : !reviewsFetching && <p className="text-sm text-on-surface-variant">No reviews yet. Be the first to book!</p>
                }
                {reviewsFetching && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              {!reviewsFetching && (reviews.length > REVIEWS_PER_PAGE || hasMore) && (
                <div className="mt-5 flex items-center gap-6">
                  {hasMore && (
                    <button
                      onClick={() => setReviewPage((p) => p + 1)}
                      className="text-sm font-bold text-primary flex items-center gap-1.5 hover:translate-x-1 transition-transform"
                    >
                      Show more ({reviews.length} of {totalReviews})
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {reviews.length > REVIEWS_PER_PAGE && (
                    <button
                      onClick={() => setReviewPage(1)}
                      className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking card */}
          <div className="col-span-1">
            <div className="sticky top-14 bg-white dark:bg-[#2d3133] p-5 rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-on-surface-variant">Price per guest</p>
                  <p className="font-headline font-extrabold text-2xl text-primary">{exp.price.toLocaleString()} ETB</p>
                </div>
                {exp.ratingsAverage >= 4.9 && (
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-lg">Rare Find</span>
                )}
              </div>
              {occurrenceDate && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 mb-3">
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">Next Occurrence</p>
                  <p className="font-headline font-bold text-sm">{occurrenceDate}</p>
                  {occurrenceTime && <p className="text-xs text-on-surface-variant">{occurrenceTime}</p>}
                </div>
              )}
              <div className="flex items-center gap-2 p-2.5 bg-tertiary-fixed/30 rounded-xl mb-4 text-xs font-medium text-on-tertiary-fixed-variant">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Limited spots available
              </div>
              {hasUpcomingBookingHere && (
                <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-950 dark:text-amber-100">
                  <p className="font-headline font-bold">You already have an upcoming booking for this experience.</p>
                  <Link to="/my-bookings" className="inline-block mt-1.5 font-bold text-primary dark:text-green-400 hover:underline">
                    View My Bookings →
                  </Link>
                </div>
              )}
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-xs font-bold text-on-surface-variant">Guests</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={hasUpcomingBookingHere || maxBookable === 0 || guests <= 1}
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    −
                  </button>
                  <span className="font-headline font-bold w-4 text-center text-sm">{guests}</span>
                  <button
                    type="button"
                    disabled={hasUpcomingBookingHere || maxBookable === 0 || guests >= maxBookable}
                    onClick={() => setGuests((g) => Math.min(maxBookable, g + 1))}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    +
                  </button>
                </div>
              </div>
              {maxBookable === 0 && (
                <p className="mb-3 text-xs font-semibold text-amber-800 dark:text-amber-200">No spots left for the next date.</p>
              )}
              <button
                type="button"
                disabled={checkoutLoading || hasUpcomingBookingHere || maxBookable === 0}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login", { state: { from: `/experiences/${id}` } });
                    return;
                  }
                  void startCheckout();
                }}
                className="w-full py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-md shadow-primary/20 hover:scale-[0.98] transition-transform disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isAuthenticated
                  ? "Sign in to Book"
                  : hasUpcomingBookingHere
                    ? "Already booked"
                    : "Book Now — Pay with Chapa"}
              </button>
              <p className="text-center text-[10px] text-on-surface-variant mt-2">
                {!isAuthenticated
                  ? "Sign in to book and pay."
                  : hasUpcomingBookingHere
                    ? "You can’t book the same experience again until this booking is no longer upcoming."
                    : "You’ll go to Chapa’s secure page to complete payment. After paying, you’ll return to My Bookings."}
              </p>
              <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-2.5 text-xs">
                <div className="flex justify-between text-on-surface-variant"><span>{exp.price.toLocaleString()} ETB × {guests} guest{guests > 1 ? "s" : ""}</span><span>{totalBase.toLocaleString()} ETB</span></div>
                <div className="flex justify-between font-headline font-bold text-primary text-sm pt-1.5 border-t border-outline-variant/20"><span>Total</span><span>{totalBase.toLocaleString()} ETB</span></div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* ── Mobile booking bottom sheet ── */}
      {showBookingModal && (
        <div className="lg:hidden fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
          <div className="relative w-full bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-on-surface-variant">Price per guest</p>
                <p className="font-headline font-extrabold text-2xl text-primary">{exp.price.toLocaleString()} ETB</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-1.5 rounded-full hover:bg-surface-container">
                <X className="h-4 w-4 text-on-surface-variant" />
              </button>
            </div>
            {occurrenceDate && (
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 mb-3">
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">Next Occurrence</p>
                <p className="font-headline font-bold text-sm">{occurrenceDate}</p>
                {occurrenceTime && <p className="text-xs text-on-surface-variant">{occurrenceTime}</p>}
              </div>
            )}
            <div className="flex items-center gap-2 p-2.5 bg-tertiary-fixed/30 rounded-xl mb-4 text-xs font-medium text-on-tertiary-fixed-variant">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Limited spots available
            </div>
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-bold text-on-surface-variant">Guests</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={hasUpcomingBookingHere || maxBookable === 0 || guests <= 1}
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  −
                </button>
                <span className="font-headline font-bold w-4 text-center text-sm">{guests}</span>
                <button
                  type="button"
                  disabled={hasUpcomingBookingHere || maxBookable === 0 || guests >= maxBookable}
                  onClick={() => setGuests((g) => Math.min(maxBookable, g + 1))}
                  className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  +
                </button>
              </div>
            </div>
            {maxBookable === 0 && (
              <p className="mb-3 text-xs font-semibold text-amber-800 dark:text-amber-200">No spots left for the next date.</p>
            )}
            <div className="mb-4 pt-3 border-t border-outline-variant/20 space-y-2 text-xs">
              <div className="flex justify-between text-on-surface-variant"><span>{exp.price.toLocaleString()} ETB × {guests}</span><span>{(exp.price * guests).toLocaleString()} ETB</span></div>
              <div className="flex justify-between font-headline font-bold text-primary text-sm pt-1.5 border-t border-outline-variant/20"><span>Total</span><span>{(exp.price * guests).toLocaleString()} ETB</span></div>
            </div>
            <button
              type="button"
              disabled={checkoutLoading || hasUpcomingBookingHere || maxBookable === 0}
              onClick={() => void startCheckout()}
              className="w-full py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-md disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {hasUpcomingBookingHere ? "Already booked" : "Pay with Chapa"}
            </button>
            <p className="text-center text-[10px] text-on-surface-variant mt-2">
              Opens secure checkout. After payment you’ll land on My Bookings to confirm your booking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceDetail;
