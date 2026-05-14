import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ban, Loader2 } from "lucide-react";
import type { AdminUser } from "@/services/admin.service";

export function SuspendUserDialog({
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#2d3133] rounded-2xl w-full max-w-md p-6 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Ban className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-headline font-extrabold text-lg text-primary">
              Suspend Account
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">
              {user.name} · {user.email}
            </p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">
          They won&apos;t be able to sign in again with this email, including any linked
          Google account. We&apos;ll send an email when outgoing mail is available.
        </p>
        <label className="block text-xs font-bold text-primary mb-2">
          Reason (shown to the user){" "}
          <span className="text-outline-variant font-medium">— optional</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="e.g. Repeated violations of our community guidelines."
          className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-1"
        />
        <p className="text-[10px] text-on-surface-variant text-right mb-5">
          {reason.length}/500
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-amber-600 flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Suspend
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
