import { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import type { AdminWithdrawal } from "@/services/admin.service";
import {
  bankDetailsForPayout,
  fmtETB,
  isValidHttpUrl,
} from "./payoutUtils";

export function MarkPaidModal({
  wr,
  onClose,
  onConfirm,
  loading,
  revealedFullAccount,
  revealingAccount,
  onRevealAccount,
}: {
  wr: AdminWithdrawal;
  onClose: () => void;
  onConfirm: (id: string, paymentReceiptUrl: string) => void;
  loading?: boolean;
  revealedFullAccount?: string;
  revealingAccount?: boolean;
  onRevealAccount: () => void | Promise<void>;
}) {
  const [receiptUrl, setReceiptUrl] = useState("");
  const bank = bankDetailsForPayout(wr);
  const receiptOk = isValidHttpUrl(receiptUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/20 dark:border-zinc-700">
        <div className="shrink-0 flex items-start justify-between px-6 pt-6 pb-2">
          <h3 className="font-headline font-extrabold text-lg text-primary dark:text-emerald-400">
            Mark as paid
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container-low dark:hover:bg-zinc-800 text-on-surface-variant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
          <p className="text-xs text-on-surface-variant dark:text-zinc-400">
            Confirm transfer to{" "}
            <strong className="text-on-surface dark:text-zinc-200">
              {wr.host?.name}
            </strong>{" "}
            for{" "}
            <strong className="text-on-surface dark:text-zinc-200">
              ETB {fmtETB(wr.amountCents ?? 0)}
            </strong>
            .
          </p>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/50 dark:bg-zinc-800/80 p-3 space-y-1.5 text-xs">
            <p>
              <span className="text-on-surface-variant">Bank: </span>
              <span className="font-semibold text-on-surface dark:text-zinc-200">
                {bank.bank}
              </span>
            </p>
            <p>
              <span className="text-on-surface-variant">Account name: </span>
              <span className="font-semibold text-on-surface dark:text-zinc-200">
                {bank.accountName}
              </span>
            </p>
            <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
              <span className="text-on-surface-variant shrink-0">
                Account no.:{" "}
              </span>
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 break-all">
                {revealedFullAccount ?? bank.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => {
                  void onRevealAccount();
                }}
                disabled={revealingAccount}
                title={
                  revealedFullAccount
                    ? "Hide account number"
                    : "Reveal full account number (audit logged)"
                }
                className="shrink-0 inline-flex p-0.5 rounded text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40 align-middle"
              >
                {revealingAccount ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : revealedFullAccount ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </p>
          </div>
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
              Payment receipt link{" "}
              <span className="text-error">(required)</span>
            </label>
            <input
              type="url"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://… link to receipt or proof of transfer"
              className="w-full bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            {receiptUrl.trim() !== "" && !receiptOk && (
              <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">
                Enter a valid URL starting with http:// or https://
              </p>
            )}
            <p className="text-[10px] text-on-surface-variant dark:text-zinc-500 mt-2 leading-relaxed">
              Hosts will see this in their wallet after you confirm. Use a
              link to a receipt image or other payment proof.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-outline-variant/15 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-outline-variant/50 dark:border-zinc-600 text-on-surface dark:text-zinc-200 font-headline font-bold text-sm hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => receiptOk && onConfirm(wr._id, receiptUrl.trim())}
            disabled={loading || !receiptOk}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm paid
          </button>
        </div>
      </div>
    </div>
  );
}
