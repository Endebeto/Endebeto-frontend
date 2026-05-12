import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { NavigateFunction } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildGalleryUrls, getGalleryPreviewSlots } from "@/components/experience/ExperienceGallery";
import {
  apiErrMessage,
  bookingExperienceId,
  REVIEWS_PER_PAGE,
} from "@/components/experience-detail/experienceDetailUtils";
import { fmtDate, fmtTime } from "@/components/experience/ExperienceReviewCard";
import { useAuth } from "@/context/AuthContext";
import { bookingsService } from "@/services/bookings.service";
import {
  experiencesService,
  type Experience,
  type Review,
} from "@/services/experiences.service";

export interface ExperienceDetailVM {
  id: string;
  navigate: NavigateFunction;
  isAuthenticated: boolean;
  exp: Experience;
  checkoutLoading: boolean;
  guests: number;
  setGuests: Dispatch<SetStateAction<number>>;
  maxBookable: number;
  hasUpcomingBookingHere: boolean;
  showBookingModal: boolean;
  setShowBookingModal: (v: boolean) => void;
  openMobileBookingSheet: () => void;
  startCheckout: () => Promise<void>;
  lightboxIndex: number | null;
  setLightboxIndex: Dispatch<SetStateAction<number | null>>;
  allGalleryImages: string[];
  galleryPreviewSlots: ReturnType<typeof getGalleryPreviewSlots>;
  reviews: Review[];
  reviewsFetching: boolean;
  reviewPage: number;
  setReviewPage: Dispatch<SetStateAction<number>>;
  totalReviews: number;
  hasMore: boolean;
  mobileMapMountRef: RefObject<HTMLDivElement | null>;
  desktopMapMountRef: RefObject<HTMLDivElement | null>;
  loadMapEmbeds: boolean;
  mapsSearchHref: string;
  unbookedApproxMapImageUrl: string | null;
  occurrenceDate: string | null;
  occurrenceTime: string | null;
  totalGuestPrice: number;
  handleCopyPublicLink: () => Promise<void>;
  handleShareExperience: () => Promise<void>;
}

export function useExperienceDetail(): {
  isLoading: boolean;
  isError: boolean;
  vm: ExperienceDetailVM | null;
} {
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
      availPayload?.available ?? expForAvail.maxGuests,
    );
    return Math.max(0, cap);
  }, [expForAvail, availPayload?.available]);

  const hasUpcomingBookingHere = useMemo(() => {
    if (!isAuthenticated || !id) return false;
    const list = myBookingsPayload ?? [];
    return list.some(
      (b) => bookingExperienceId(b) === id && b.status === "upcoming",
    );
  }, [isAuthenticated, id, myBookingsPayload]);

  const openMobileBookingSheet = useCallback(() => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/experiences/${id}` } });
      return;
    }
    if (hasUpcomingBookingHere) return;
    setShowBookingModal(true);
  }, [id, isAuthenticated, navigate, hasUpcomingBookingHere]);

  useEffect(() => {
    if (hasUpcomingBookingHere && showBookingModal) setShowBookingModal(false);
  }, [hasUpcomingBookingHere, showBookingModal]);

  useEffect(() => {
    setGuests((g) => {
      if (maxBookable === 0) return 0;
      return Math.min(Math.max(1, g), maxBookable);
    });
  }, [maxBookable]);

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
  }, [
    id,
    isAuthenticated,
    guests,
    navigate,
    hasUpcomingBookingHere,
    maxBookable,
  ]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [reviewPage, setReviewPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReviewPage(1);
    setReviews([]);
  }, [id]);

  const { data: reviewsData, isFetching: reviewsFetching } = useQuery({
    queryKey: ["reviews", id, reviewPage],
    queryFn: () =>
      experiencesService.getReviews(id!, {
        page: reviewPage,
        limit: REVIEWS_PER_PAGE,
      }),
    enabled: !!id,
    staleTime: 60_000,
  });

  useEffect(() => {
    const incoming = reviewsData?.data.data.data;
    if (!incoming) return;
    setReviews((prev) =>
      reviewPage === 1 ? incoming : [...prev, ...incoming],
    );
  }, [reviewsData, reviewPage]);

  const totalReviews = reviewsData?.data.results ?? 0;
  const hasMore = reviews.length < totalReviews;

  const exp = data?.data.data.data;

  const mobileMapMountRef = useRef<HTMLDivElement>(null);
  const desktopMapMountRef = useRef<HTMLDivElement>(null);
  const [loadMapEmbeds, setLoadMapEmbeds] = useState(false);

  useEffect(() => {
    setLoadMapEmbeds(false);
  }, [id]);

  useEffect(() => {
    if (!hasUpcomingBookingHere || loadMapEmbeds || isLoading) return;
    const nodes = [mobileMapMountRef.current, desktopMapMountRef.current].filter(
      (n): n is HTMLDivElement => n !== null,
    );
    if (nodes.length === 0) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLoadMapEmbeds(true);
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );
    nodes.forEach((n) => ob.observe(n));
    return () => ob.disconnect();
  }, [hasUpcomingBookingHere, loadMapEmbeds, exp?._id, isLoading]);

  const allGalleryImages = useMemo(
    () => (exp ? buildGalleryUrls(exp.imageCover, exp.images) : []),
    [exp],
  );
  const galleryPreviewSlots = useMemo(
    () => getGalleryPreviewSlots(allGalleryImages),
    [allGalleryImages],
  );
  const occurrenceDate = useMemo(
    () => fmtDate(exp?.nextOccurrenceAt),
    [exp?.nextOccurrenceAt],
  );
  const occurrenceTime = useMemo(
    () => fmtTime(exp?.nextOccurrenceAt),
    [exp?.nextOccurrenceAt],
  );

  const mapsSearchHref = useMemo(() => {
    if (!exp) return "#";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.location)}`;
  }, [exp]);

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

  const vm = useMemo((): ExperienceDetailVM | null => {
    if (!id || !exp) return null;
    return {
      id,
      navigate,
      isAuthenticated,
      exp,
      checkoutLoading,
      guests,
      setGuests,
      maxBookable,
      hasUpcomingBookingHere,
      showBookingModal,
      setShowBookingModal,
      openMobileBookingSheet,
      startCheckout,
      lightboxIndex,
      setLightboxIndex,
      allGalleryImages,
      galleryPreviewSlots,
      reviews,
      reviewsFetching,
      reviewPage,
      setReviewPage,
      totalReviews,
      hasMore,
      mobileMapMountRef,
      desktopMapMountRef,
      loadMapEmbeds,
      mapsSearchHref,
      unbookedApproxMapImageUrl,
      occurrenceDate,
      occurrenceTime,
      totalGuestPrice: exp.price * guests,
      handleCopyPublicLink,
      handleShareExperience,
    };
  }, [
    id,
    navigate,
    isAuthenticated,
    exp,
    checkoutLoading,
    guests,
    maxBookable,
    hasUpcomingBookingHere,
    showBookingModal,
    openMobileBookingSheet,
    startCheckout,
    lightboxIndex,
    allGalleryImages,
    galleryPreviewSlots,
    reviews,
    reviewsFetching,
    reviewPage,
    totalReviews,
    hasMore,
    loadMapEmbeds,
    mapsSearchHref,
    unbookedApproxMapImageUrl,
    occurrenceDate,
    occurrenceTime,
    handleCopyPublicLink,
    handleShareExperience,
  ]);

  const resolvedError = isError || (!isLoading && !exp);
  return {
    isLoading,
    isError: resolvedError,
    vm,
  };
}
