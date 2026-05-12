import { AlertCircle, Loader2, X } from "lucide-react";
import type { ExperienceDetailVM } from "@/hooks/useExperienceDetail";

export function ExperienceDetailBookingSheet({ vm }: { vm: ExperienceDetailVM }) {
  const {
    exp,
    checkoutLoading,
    guests,
    setGuests,
    hasUpcomingBookingHere,
    maxBookable,
    occurrenceDate,
    occurrenceTime,
    setShowBookingModal,
    startCheckout,
    totalGuestPrice,
  } = vm;

  return (
    <div className="lg:hidden fixed inset-0 z-[60] flex items-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm border-0 cursor-default"
        aria-label="Close booking sheet"
        onClick={() => setShowBookingModal(false)}
      />
      <div className="relative w-full bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-on-surface-variant">Price per guest</p>
            <p className="font-headline font-extrabold text-2xl text-primary">
              {exp.price.toLocaleString()} ETB
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBookingModal(false)}
            className="p-1.5 rounded-full hover:bg-surface-container"
          >
            <X className="h-4 w-4 text-on-surface-variant" />
          </button>
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
        <div className="mb-4 pt-3 border-t border-outline-variant/20 space-y-2 text-xs">
          <div className="flex justify-between text-on-surface-variant">
            <span>
              {exp.price.toLocaleString()} ETB × {guests}
            </span>
            <span>{totalGuestPrice.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between font-headline font-bold text-primary text-sm pt-1.5 border-t border-outline-variant/20">
            <span>Total</span>
            <span>{totalGuestPrice.toLocaleString()} ETB</span>
          </div>
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
          Opens secure checkout. After payment you’ll land on My Bookings to
          confirm your booking.
        </p>
      </div>
    </div>
  );
}
