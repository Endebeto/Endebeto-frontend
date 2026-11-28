import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { bookingsService, type Booking } from "@/services/bookings.service";
import { hostQueryKeys } from "@/lib/hostQueryKeys";
import { useModalA11y } from "@/hooks/useModalA11y";
import { getFriendlyErrorMessage } from "@/lib/errors";

/** True when the host may still cancel this booking with a refund (P2-4). */
export function canHostCancel(b: Booking): boolean {
  if (b.status !== "upcoming" || !b.paid) return false;
  const when = b.experienceDate ? new Date(b.experienceDate).getTime() : NaN;
  return Number.isFinite(when) && when > Date.now();
}

/**
 * P2-4: host cancels a paid booking. The guest is refunded in full and the
 * host's earnings for it are reversed.
 */
export function HostCancelDialog({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const titleId = useId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => bookingsService.hostCancelBooking(booking._id, reason.trim()),
    onSuccess: () => {
      toast.success("Booking cancelled. The guest will get a full refund.");
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.bookings.all() });
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.wallet.summary() });
      onClose();
    },
    onError: (err: unknown) =>
      toast.error(getFriendlyErrorMessage(err, "Couldn't cancel this booking.")),
  });
  const dialogRef = useModalA11y<HTMLDivElement>({
    onClose,
    closeDisabled: mutation.isPending,
  });
  const valid = reason.trim().length >= 5 && reason.trim().length <= 500;
  const guestName = booking.user?.name ?? "the guest";
  const title = typeof booking.experience === "object" ? booking.experience.title : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 p-6 outline-none"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 id={titleId} className="font-headline font-extrabold text-lg text-red-700 dark:text-red-400">
            Cancel &amp; refund booking
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-surface-container-low dark:hover:bg-zinc-800 text-on-surface-variant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-4 leading-relaxed">
          {guestName}&apos;s booking{title ? ` for ${title}` : ""} will be cancelled and they will
          receive a <strong>full refund of ETB {(booking.price ?? 0).toLocaleString()}</strong>.
          Your earnings for this booking are reversed. This can&apos;t be undone.
        </p>
        <label
          htmlFor={`${titleId}-reason`}
          className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2"
        >
          Reason (shared with the guest)
        </label>
        <textarea
          id={`${titleId}-reason`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. I'm unwell and can't host this session."
          className="w-full bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 py-3 rounded-xl border border-outline-variant/50 dark:border-zinc-600 text-on-surface dark:text-zinc-200 font-headline font-bold text-sm hover:bg-surface-container-low dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            Keep booking
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!valid || mutation.isPending}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-headline font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Cancel &amp; refund
          </button>
        </div>
      </div>
    </div>
  );
}
