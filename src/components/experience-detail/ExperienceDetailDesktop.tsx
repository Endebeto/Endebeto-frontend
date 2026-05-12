import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
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
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
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

export function ExperienceDetailDesktop({ vm }: { vm: ExperienceDetailVM }) {
  const {
    id,
    navigate,
    isAuthenticated,
    exp,
    checkoutLoading,
    guests,
    setGuests,
    maxBookable,
    hasUpcomingBookingHere,
    startCheckout,
    setLightboxIndex,
    allGalleryImages,
    galleryPreviewSlots,
    mapsSearchHref,
    unbookedApproxMapImageUrl,
    desktopMapMountRef,
    loadMapEmbeds,
    handleCopyPublicLink,
    handleShareExperience,
    reviews,
    reviewsFetching,
    setReviewPage,
    totalReviews,
    hasMore,
    occurrenceDate,
    occurrenceTime,
    totalGuestPrice,
  } = vm;

  return (
    <div className="hidden lg:block">
      <Navbar />

      <section className="relative h-[420px] w-full overflow-hidden">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="absolute inset-0 block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset z-0"
          aria-label="View cover photo full screen"
        >
          <img
            src={exp.imageCover}
            alt={exp.title}
            className="w-full h-full object-cover pointer-events-none"
          />
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
              style={{
                textShadow: "0 2px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)",
              }}
            >
              {exp.title}
            </h1>
            <div
              className="flex items-center gap-4 mt-3 text-white text-sm"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
            >
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 fill-current text-on-tertiary-container" />
                {exp.location}
              </span>
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

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, label: "Duration", value: exp.duration },
              { icon: Users, label: "Max Guests", value: `Up to ${exp.maxGuests}` },
              { icon: Globe, label: "Languages", value: "English, Amharic" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-white dark:bg-[#2d3133] p-4 rounded-xl shadow-sm"
              >
                <Icon className="h-4 w-4 text-primary mb-1.5" />
                <p className="text-xs text-on-surface-variant">{label}</p>
                <p className="font-headline font-bold text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-headline font-extrabold text-lg text-primary mb-3">
              About this Experience
            </h2>
            <div className="space-y-3 text-on-surface-variant text-sm leading-relaxed">
              <ExperienceDescriptionMarkdown markdown={exp.description} />
              {exp.summary && exp.summary !== exp.description && (
                <p className="text-xs italic opacity-80">{exp.summary}</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-extrabold text-lg text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5" />
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
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-on-surface">
                  {hasUpcomingBookingHere
                    ? exp.address || exp.location
                    : exp.location}
                </p>
                {hasUpcomingBookingHere ? (
                  <p className="text-xs text-primary dark:text-green-400 font-medium">
                    You&apos;re booked — exact meetup point unlocked
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    Exact meetup point shared after booking
                  </p>
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
                      Open approximate area in Google Maps{" "}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </UnbookedMapPlaceholder>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-headline font-extrabold text-lg text-primary">
                Guest Reviews
              </h2>
              {exp.ratingsAverage !== null && (
                <span className="flex items-center gap-1 text-sm text-on-surface-variant">
                  <Star className="h-3.5 w-3.5 fill-current text-on-tertiary-container" />
                  <strong className="text-foreground">
                    {exp.ratingsAverage.toFixed(1)}
                  </strong>{" "}
                  · {exp.ratingsQuantity} reviews
                </span>
              )}
            </div>
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <ReviewCard key={r._id} review={r} index={i} />
                ))
              ) : (
                !reviewsFetching && (
                  <p className="text-sm text-on-surface-variant">
                    No reviews yet. Be the first to book!
                  </p>
                )
              )}
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
                    type="button"
                    onClick={() => setReviewPage((p) => p + 1)}
                    className="text-sm font-bold text-primary flex items-center gap-1.5 hover:translate-x-1 transition-transform"
                  >
                    Show more ({reviews.length} of {totalReviews})
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {reviews.length > REVIEWS_PER_PAGE && (
                  <button
                    type="button"
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

        <div className="col-span-1">
          <div className="sticky top-14 bg-white dark:bg-[#2d3133] p-5 rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-on-surface-variant">Price per guest</p>
                <p className="font-headline font-extrabold text-2xl text-primary">
                  {exp.price.toLocaleString()} ETB
                </p>
              </div>
              {exp.ratingsAverage >= 4.9 && (
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-lg">
                  Rare Find
                </span>
              )}
            </div>
            {occurrenceDate && (
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 mb-3">
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">
                  Next Occurrence
                </p>
                <p className="font-headline font-bold text-sm">{occurrenceDate}</p>
                {occurrenceTime && (
                  <p className="text-xs text-on-surface-variant">{occurrenceTime}</p>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 p-2.5 bg-tertiary-fixed/30 rounded-xl mb-4 text-xs font-medium text-on-tertiary-fixed-variant">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Limited spots
              available
            </div>
            {hasUpcomingBookingHere && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-950 dark:text-amber-100">
                <p className="font-headline font-bold">
                  You already have an upcoming booking for this experience.
                </p>
                <Link
                  to="/my-bookings"
                  className="inline-block mt-1.5 font-bold text-primary dark:text-green-400 hover:underline"
                >
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
                <span className="font-headline font-bold w-4 text-center text-sm">
                  {guests}
                </span>
                <button
                  type="button"
                  disabled={
                    hasUpcomingBookingHere || maxBookable === 0 || guests >= maxBookable
                  }
                  onClick={() => setGuests((g) => Math.min(maxBookable, g + 1))}
                  className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  +
                </button>
              </div>
            </div>
            {maxBookable === 0 && (
              <p className="mb-3 text-xs font-semibold text-amber-800 dark:text-amber-200">
                No spots left for the next date.
              </p>
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
              <div className="flex justify-between text-on-surface-variant">
                <span>
                  {exp.price.toLocaleString()} ETB × {guests} guest
                  {guests > 1 ? "s" : ""}
                </span>
                <span>{totalGuestPrice.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between font-headline font-bold text-primary text-sm pt-1.5 border-t border-outline-variant/20">
                <span>Total</span>
                <span>{totalGuestPrice.toLocaleString()} ETB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
