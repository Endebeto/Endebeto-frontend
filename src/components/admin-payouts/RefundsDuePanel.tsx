import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { adminService, type PaymentIncident } from "@/services/admin.service";
import { useModalA11y } from "@/hooks/useModalA11y";
import { getFriendlyErrorMessage } from "@/lib/errors";

const QUERY_KEY = ["admin", "payment-incidents", "open"] as const;

const REASON_LABEL: Record<PaymentIncident["reason"], string> = {
  host_cancelled: "Host cancelled",
  sold_out: "Sold out after payment",
  not_scheduled: "Session removed after payment",
  amount_mismatch: "Amount mismatch",
  experience_unavailable: "Experience unavailable",
  other: "Other",
};

/**
 * P2-4: guests owed money — host cancellations and payments that could not
 * become bookings. Refund in the Chapa dashboard, then record it here.
 */
export function RefundsDuePanel() {
  const [target, setTarget] = useState<PaymentIncident | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => (await adminService.listPaymentIncidents({ status: "open", limit: 50 })).data,
    staleTime: 30_000,
  });
  const incidents = data?.data.incidents ?? [];

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/15 dark:border-zinc-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-headline font-extrabold text-lg text-primary flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Refunds due
          </h2>
          <p className="text-xs text-on-surface-variant">
            Refund in the Chapa dashboard, then mark it refunded here with the Chapa reference.
          </p>
        </div>
        <span className="text-xs font-bold text-on-surface-variant">{data?.openCount ?? 0} open</span>
      </div>

      {isLoading && <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant" />}
      {isError && <p className="text-sm text-error">Couldn&apos;t load refunds.</p>}
      {!isLoading && !isError && incidents.length === 0 && (
        <p className="text-sm text-on-surface-variant">Nothing to refund.</p>
      )}

      {incidents.length > 0 && (
        <ul className="divide-y divide-outline-variant/10 dark:divide-zinc-800">
          {incidents.map((i) => (
            <li key={i._id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface dark:text-white truncate">
                  {i.user?.name ?? "Guest"} · ETB {(i.paidAmount ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-on-surface-variant truncate">
                  {REASON_LABEL[i.reason] ?? i.reason}
                  {i.experience?.title ? ` · ${i.experience.title}` : ""} · {i.txRef}
                </p>
                {i.message && (
                  <p className="text-[11px] text-on-surface-variant/80 mt-0.5 line-clamp-2">{i.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setTarget(i)}
                className="self-start sm:self-auto text-xs font-bold px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90"
              >
                Mark refunded
              </button>
            </li>
          ))}
        </ul>
      )}

      {target && <MarkRefundedDialog incident={target} onClose={() => setTarget(null)} />}
    </section>
  );
}

function MarkRefundedDialog({
  incident,
  onClose,
}: {
  incident: PaymentIncident;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const titleId = useId();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => adminService.resolvePaymentIncident(incident._id, "refunded", note.trim()),
    onSuccess: () => {
      toast.success("Marked as refunded");
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      onClose();
    },
    onError: (err: unknown) => toast.error(getFriendlyErrorMessage(err, "Couldn't update the refund.")),
  });
  const dialogRef = useModalA11y<HTMLDivElement>({ onClose, closeDisabled: mutation.isPending });

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
          <h3 id={titleId} className="font-headline font-extrabold text-lg text-primary">
            Mark refund as done
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-surface-container-low text-on-surface-variant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-on-surface-variant mb-4">
          ETB {(incident.paidAmount ?? 0).toLocaleString()} to {incident.user?.name ?? "the guest"} (
          {incident.txRef}).
        </p>
        <label htmlFor={`${titleId}-note`} className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
          Chapa refund reference
        </label>
        <input
          id={`${titleId}-note`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. RF-20261128-0001"
          className="w-full bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm mb-4"
        />
        <button
          type="button"
          disabled={note.trim().length < 3 || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="w-full py-3 rounded-xl bg-primary text-white font-headline font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Mark refunded
        </button>
      </div>
    </div>
  );
}
