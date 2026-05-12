import { Ban, Loader2 } from "lucide-react";
import { useState } from "react";
import type { AdminExperience } from "@/services/admin.service";

export function SuspendModal({
  exp,
  onClose,
  onConfirm,
  isPending,
}: {
  exp: AdminExperience;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/15 dark:border-zinc-700 max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Ban className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface dark:text-white">
              Suspend listing
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5 line-clamp-1">
              {exp.title}
            </p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-3">
          The listing will disappear from the public catalog until you reinstate
          it. Hosts will see why it was suspended.
        </p>
        <label className="block text-xs font-bold text-on-surface dark:text-white mb-2">
          Reason (shown to host)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Pricing or photos need review — please update and contact support."
          className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-5"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 dark:border-zinc-600 text-sm font-semibold text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onConfirm(reason.trim() || "Suspended by platform")}
            className="flex-1 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
}
