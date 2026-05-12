import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  Clock,
  ExternalLink,
  Globe,
  Link2,
  Loader2,
  MapPin,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { ContactHostButton } from "@/components/experience/ContactHostButton";
import {
  GalleryMoreOverlay,
} from "@/components/experience/ExperienceGallery";
import { ReviewCard } from "@/components/experience/ExperienceReviewCard";
import { ExperienceDescriptionMarkdown } from "@/components/ExperienceDescriptionMarkdown";
import { UnbookedMapPlaceholder } from "@/components/experience-detail/UnbookedMapPlaceholder";
import { REVIEWS_PER_PAGE } from "@/components/experience-detail/experienceDetailUtils";
import { UserAvatar } from "@/components/UserAvatar";
import type { ExperienceDetailVM } from "@/hooks/useExperienceDetail";

export function ExperienceDetailMobile({ vm }: { vm: ExperienceDetailVM }) {
  const {
    navigate,
    exp,
    hasUpcomingBookingHere,
    maxBookable,
    openMobileBookingSheet,
    setLightboxIndex,
    allGalleryImages,
    galleryPreviewSlots,
    mapsSearchHref,
    unbookedApproxMapImageUrl,
    mobileMapMountRef,
    loadMapEmbeds,
    handleCopyPublicLink,
    handleShareExperience,
    reviews,
    reviewsFetching,
    setReviewPage,
    totalReviews,
    hasMore,
  } = vm;

  return (
    <div className="lg:hidden">
        <div className="relative h-[52vh] w-full overflow-hidden">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute inset-0 block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset"
            aria-label="View cover photo full screen"
          >
            <img
              src={exp.imageCover}
              alt={exp.title}
              className="w-full h-full object-cover pointer-events-none"
            />
          </button>

          <div
            className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 z-20"
            style={{
              paddingTop:
                "max(0.25rem, env(safe-area-inset-top, 0px) + 0.25rem)",
            }}
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
                  <strong className="text-on-surface dark:text-white">
                    {exp.ratingsAverage.toFixed(1)}
                  </strong>
                  <span>({exp.ratingsQuantity} reviews)</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-4 mt-3 border-t border-b border-outline-variant/15 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={exp.host?.name}
                  photo={exp.host?.photo}
                  className="w-10 h-10 rounded-full bg-secondary-container shrink-0 ring-2 ring-white dark:ring-zinc-900"
                  initialsClassName="text-on-secondary-container text-sm"
                />
                <div>
                  <p className="text-[10px] text-on-surface-variant dark:text-zinc-500 uppercase tracking-wider">
                    Hosted by
                  </p>
                  <p className="font-headline font-bold text-sm text-on-surface dark:text-white">
                    {exp.host?.name}
                  </p>
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
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <GalleryMoreOverlay moreCount={moreCount} compact />
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pb-5 border-b border-outline-variant/15 dark:border-zinc-800">
              {[
                { icon: Clock, label: "DURATION", value: exp.duration },
                {
                  icon: Users,
                  label: "GROUP SIZE",
                  value: `Up to ${exp.maxGuests}`,
                },
                { icon: Globe, label: "LANGUAGES", value: "English, Amharic" },
                {
                  icon: Star,
                  label: "RATING",
                  value:
                    exp.ratingsAverage !== null
                      ? `${exp.ratingsAverage.toFixed(1)} / 5.0`
                      : "New",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5 py-2">
                  <Icon className="h-4 w-4 text-on-surface-variant dark:text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-500">
                      {label}
                    </p>
                    <p className="font-headline font-bold text-sm text-on-surface dark:text-white mt-0.5">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="py-5 border-b border-outline-variant/15 dark:border-zinc-800">
              <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white mb-3">
                About this Experience
              </h2>
              <ExperienceDescriptionMarkdown
                markdown={exp.description}
                className="text-xs [&_p]:text-xs [&_li]:text-xs [&_ul]:text-xs [&_ol]:text-xs"
              />
            </div>

            <div className="py-5 border-b border-outline-variant/15 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white">
                  Where you&apos;ll meet
                </h2>
                {hasUpcomingBookingHere && (
                  <a
                    href={
                      exp.latitude && exp.longitude
                        ? `https://www.google.com/maps/dir/?api=1&destination=${exp.latitude},${exp.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.location)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-primary dark:text-green-400 flex items-center gap-1"
                  >
                    Open Maps <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-3 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                {hasUpcomingBookingHere
                  ? exp.address || exp.location
                  : exp.location}
                {!hasUpcomingBookingHere && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
                    · Exact meetup point shared after booking
                  </span>
                )}
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
                        <MapPin
                          className="h-9 w-9 text-outline-variant/45"
                          aria-hidden
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <UnbookedMapPlaceholder
                    mapImageUrl={unbookedApproxMapImageUrl}
                  >
                    <div className="rounded-xl border border-outline-variant/20 bg-white px-4 py-3 text-center shadow-lg dark:bg-zinc-900">
                      <MapPin className="mx-auto mb-1 h-5 w-5 text-primary" />
                      <p className="text-xs font-bold text-on-surface dark:text-white">
                        Exact meetup point shared after booking
                      </p>
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

            <div className="py-5">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white">
                  Guest Reviews
                </h2>
                {exp.ratingsAverage !== null && (
                  <span className="text-xs text-on-surface-variant dark:text-zinc-400 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <strong className="text-on-surface dark:text-white">
                      {exp.ratingsAverage.toFixed(1)}
                    </strong>{" "}
                    · {exp.ratingsQuantity}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <ReviewCard key={r._id} review={r} index={i} />
                  ))
                ) : (
                  !reviewsFetching && (
                    <p className="text-xs text-on-surface-variant">
                      No reviews yet. Be the first!
                    </p>
                  )
                )}
                {reviewsFetching && (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              {!reviewsFetching &&
                (reviews.length > REVIEWS_PER_PAGE || hasMore) && (
                  <div className="mt-4 flex items-center gap-4">
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => setReviewPage((p) => p + 1)}
                        className="text-xs font-bold text-primary dark:text-green-400 flex items-center gap-1 hover:translate-x-1 transition-transform"
                      >
                        Show more ({reviews.length}/{totalReviews})
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {reviews.length > REVIEWS_PER_PAGE && (
                      <button
                        type="button"
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

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-outline-variant/20 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div>
            <p className="text-[10px] text-on-surface-variant dark:text-zinc-500">
              Price per guest
            </p>
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
              {hasUpcomingBookingHere
                ? "Already booked"
                : maxBookable === 0
                  ? "Sold out"
                  : "Book Now"}
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
  );
}
