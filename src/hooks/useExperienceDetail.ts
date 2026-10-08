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
import { slotsService, type ExperienceSlot } from "@/services/slots.service";

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
  slots: ExperienceSlot[];
  selectedSlot: ExperienceSlot | null;
  setSelectedSlot: (slot: ExperienceSlot | null) => void;
  slotsLoading: boolean;
  bookedSlotIds: Set<string>;
  maxGuestsDisplay: string;
  effectivePrice: number;
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

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["experience-slots", id],
    queryFn: () => slotsService.getExperienceSlots(id!),
    enabled: !!id,
    staleTime: 30_000,
  });

  const slots = useMemo(
    () => slotsData?.data?.data?.slots ?? [],
    [slotsData],
  );
  const [selectedSlot, setSelectedSlot] = useState<ExperienceSlot | null>(null);
  const userManuallySelectedRef = useRef(false);

  const bookedSlotIds = useMemo(() => {
    if (!isAuthenticated || !myBookingsPayload) return new Set<string>();
    const set = new Set<string>();
    myBookingsPayload.forEach((b) => {
      if (bookingExperienceId(b) === id && b.status === "upcoming") {
        const slotId =
          typeof b.slot === "object" && b.slot !== null ? b.slot._id : b.slot;
        if (slotId) set.add(String(slotId));
      }
    });
    return set;
  }, [isAuthenticated, myBookingsPayload, id]);

  const handleSelectSlot = useCallback((slot: ExperienceSlot | null) => {
    userManuallySelectedRef.current = true;
    setSelectedSlot(slot);
  }, []);

  useEffect(() => {
    if (slots.length === 0) return;

    // Check if the currently selected slot is one the user has already booked
    const currentIsBooked =
      selectedSlot && bookedSlotIds.has(String(selectedSlot._id));

    // If no slot selected yet, or if current selection was auto-selected and is booked by user
    if (!selectedSlot || (!userManuallySelectedRef.current && currentIsBooked)) {
      const unbooked = slots.find(
        (s) => s.isBookable && !bookedSlotIds.has(String(s._id)),
      );
      const fallback = slots.find((s) => s.isBookable) || slots[0];
      if (unbooked) setSelectedSlot(unbooked);
      else if (!selectedSlot && fallback) setSelectedSlot(fallback);
    }
  }, [slots, selectedSlot, bookedSlotIds]);

  const effectivePrice = useMemo(() => {
    if (
      selectedSlot &&
      selectedSlot.price != null &&
      Number.isFinite(Number(selectedSlot.price)) &&
      Number(selectedSlot.price) > 0
    ) {
      return Number(selectedSlot.price);
    }
    return expForAvail?.price ?? 0;
  }, [selectedSlot, expForAvail?.price]);

  const totalGuestPrice = useMemo(
    () => effectivePrice * guests,
    [effectivePrice, guests],
  );

  const maxBookable = useMemo(() => {
    if (selectedSlot) {
      return Math.max(0, selectedSlot.availableSpots);
    }
    if (!expForAvail) return 1;
    const cap = Math.min(
      expForAvail.maxGuests,
      availPayload?.available ?? expForAvail.maxGuests,
    );
    return Math.max(0, cap);
  }, [selectedSlot, expForAvail, availPayload?.available]);

  const maxGuestsDisplay = useMemo(() => {
    if (selectedSlot && selectedSlot.maxGuests) {
      return `Up to ${selectedSlot.maxGuests}`;
    }
    if (slots.length > 0) {
      const capacities = slots.map(
        (s) => Number(s.maxGuests) || expForAvail?.maxGuests || 1,
      );
      const min = Math.min(...capacities);
      const max = Math.max(...capacities);
      if (min !== max) {
        return `${min} – ${max} guests`;
      }
      return `Up to ${max}`;
    }
    return `Up to ${expForAvail?.maxGuests ?? 1}`;
  }, [selectedSlot, slots, expForAvail?.maxGuests]);

  // True only if the CURRENTLY SELECTED session is already booked by the user
  const hasUpcomingBookingHere = useMemo(() => {
    if (!isAuthenticated || !id) return false;
    const list = myBookingsPayload ?? [];
    if (slots.length > 0) {
      if (!selectedSlot) return false;
      return bookedSlotIds.has(String(selectedSlot._id));
    }
    // Legacy single occurrence listing
    return list.some((b) => {
      return bookingExperienceId(b) === id && b.status === "upcoming";
    });
  }, [isAuthenticated, id, myBookingsPayload, slots.length, selectedSlot, bookedSlotIds]);

  const openMobileBookingSheet = useCallback(() => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/experiences/${id}` } });
      return;
    }
    if (slots.length === 0 && hasUpcomingBookingHere) return;
    setShowBookingModal(true);
  }, [id, isAuthenticated, navigate, slots.length, hasUpcomingBookingHere]);

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
    if (slots.length > 0 && !selectedSlot) {
      toast.error("Please choose a date and time slot first.");
      return;
    }
    if (hasUpcomingBookingHere) {
      toast.info(
        selectedSlot
          ? "You already have an upcoming booking for this session. Pick a different date."
          : "You already have an upcoming booking for this experience.",
      );
      return;
    }
    if (maxBookable === 0) {
      toast.error("No spots available for the selected session.");
      return;
    }
    if (guests < 1 || guests > maxBookable) {
      toast.error("Choose a valid number of guests for the remaining spots.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await bookingsService.getCheckoutSession(
        id,
        guests,
        selectedSlot?._id,
      );
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
    selectedSlot,
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
  const activeOccurrenceIso = selectedSlot
    ? selectedSlot.startTime
    : exp?.nextOccurrenceAt;
  const occurrenceDate = useMemo(
    () => fmtDate(activeOccurrenceIso),
    [activeOccurrenceIso],
  );
  const occurrenceTime = useMemo(
    () => fmtTime(activeOccurrenceIso),
    [activeOccurrenceIso],
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
      slots,
      selectedSlot,
      setSelectedSlot: handleSelectSlot,
      slotsLoading,
      bookedSlotIds,
      maxGuestsDisplay,
      effectivePrice,
      totalGuestPrice,
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
    slots,
    selectedSlot,
    handleSelectSlot,
    slotsLoading,
    bookedSlotIds,
    maxGuestsDisplay,
    effectivePrice,
    totalGuestPrice,
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
