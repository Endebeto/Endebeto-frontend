import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { AdminWithdrawal } from "@/services/admin.service";

export function FailModal({
  wr,
  onClose,
  onConfirm,
  loading,
}: {
  wr: AdminWithdrawal;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
  loading?: boolean;
}) {
  const [reason, setReason] = useState("Invalid Account Number");
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/20 dark:border-zinc-700">
        <div className="shrink-0 flex items-start justify-between px-6 pt-6 pb-2">
          <h3 className="font-headline font-extrabold text-lg text-red-700 dark:text-red-400">
            Mark Payout as Failed
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container-low dark:hover:bg-zinc-800 text-on-surface-variant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-4">
            Specify the reason for failure for{" "}
            <strong className="text-on-surface dark:text-zinc-200">
              {wr.host?.name}
            </strong>
            . This will be visible to the host.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                Reason Code
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option>Invalid Account Number</option>
                <option>Bank Rejection (Insufficient Funds)</option>
                <option>Incomplete Bank Profile</option>
                <option>Verification Required</option>
                <option>Other (Specify below)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                Internal Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Details for the audit log..."
                className="w-full bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
              />
            </div>
          </div>
        </div>
        <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-outline-variant/15 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-outline-variant/50 dark:border-zinc-600 text-on-surface dark:text-zinc-200 font-headline font-bold text-sm hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm(wr._id, `${reason}${note ? `: ${note}` : ""}`)
            }
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-headline font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Failure
          </button>
        </div>
      </div>
    </div>
  );
}
