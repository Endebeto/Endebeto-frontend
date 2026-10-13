import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  X,
  AlertCircle,
  Info,
  Loader2,
  Clock,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { walletService } from "@/services/wallet.service";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { isHoldActive, usePayoutAccount } from "@/hooks/usePayoutAccount";
import { etb, fmtDateTime } from "./walletFormatters";

export function WithdrawModal({
  availableETB,
  onClose,
  onChangeAccount,
  onWithdrawComplete,
}: {
  availableETB: number;
  onClose: () => void;
  /** Close the modal and open the payout-account section. */
  onChangeAccount: () => void;
  onWithdrawComplete: () => Promise<void>;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true);

  const { data: account, isLoading: accountLoading } = usePayoutAccount();
  const noAccount = !accountLoading && !account?.hasAccount;
  const holdActive = isHoldActive(account?.holdUntil);

  const [form, setForm] = useState({ amountETB: "" });
  const [touched, setTouched] = useState({ amountETB: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const clientRequestIdRef = useRef(
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `wr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  );

  const touch = (field: keyof typeof touched) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const amount = parseFloat(form.amountETB) || 0;
  const tooLow = amount > 0 && amount < 10;
  const tooHigh = amount > 100_000;
  const overBalance = amount > availableETB;
  const noAmount = form.amountETB.trim() === "";
  const valid =
    !noAmount &&
    !tooLow &&
    !tooHigh &&
    !overBalance &&
    !!account?.hasAccount &&
    !holdActive;

  const show = (field: keyof typeof touched) =>
    touched[field] || submitAttempted;

  const mutation = useMutation({
    mutationFn: () =>
      walletService.createWithdrawal({
        amountETB: amount,
        clientRequestId: clientRequestIdRef.current,
      }),
    onSuccess: async () => {
      toast.success("Withdrawal submitted. Funds moved to payout pending.", {
        duration: 5000,
      });
      await onWithdrawComplete();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(
        getFriendlyErrorMessage(
          err,
          "Failed to submit withdrawal request. Please try again.",
        ),
        {
          duration: 6000,
          className:
            "border-red-500 [&_[data-title]]:text-red-700 dark:[&_[data-title]]:text-red-300",
        },
      );
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !mutation.isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, mutation.isPending]);

  const handleSubmit = () => {
    if (mutation.isPending || mutation.isSuccess) return;
    setSubmitAttempted(true);
    if (!valid) {
      toast.error("Please fix the errors in the form before submitting.", {
        duration: 4000,
        className:
          "border-red-500 [&_[data-title]]:text-red-700 dark:[&_[data-title]]:text-red-300",
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-funds-title"
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 w-full max-w-md max-h-[90vh] flex flex-col outline-none"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10 dark:border-zinc-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffddb8]/60 flex items-center justify-center">
              <ArrowDownToLine className="h-4 w-4 text-[#653e00]" />
            </div>
            <h3
              id="withdraw-funds-title"
              className="font-headline font-bold text-base text-on-surface dark:text-white"
            >
              Withdraw Funds
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-zinc-800 text-on-surface-variant transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {noAccount ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-surface-container-low dark:bg-zinc-800 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-on-surface-variant dark:text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-on-surface dark:text-white">
                Add a payout account first
              </p>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                Save your bank details once and we&apos;ll use them for every
                withdrawal.
              </p>
              <button
                type="button"
                onClick={onChangeAccount}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors"
              >
                Add payout account
              </button>
            </div>
          ) : (
            <>
          <div className="flex items-center justify-between p-3 bg-surface-container-low dark:bg-zinc-800 rounded-xl text-xs">
            <span className="text-on-surface-variant dark:text-zinc-400">
              Available to withdraw
            </span>
            <span className="font-bold text-primary dark:text-green-400">
              ETB {etb(availableETB * 100)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
              Amount (ETB) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant dark:text-zinc-400">
                ETB
              </span>
              <input
                type="number"
                placeholder="0.00"
                min={10}
                max={100000}
                value={form.amountETB}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amountETB: e.target.value }))
                }
                onBlur={() => touch("amountETB")}
                className={`w-full pl-14 pr-4 py-3 rounded-xl border text-on-surface dark:text-white text-sm font-semibold outline-none focus:ring-2 transition-all bg-white dark:bg-zinc-800 ${
                  show("amountETB") &&
                  (noAmount || tooLow || tooHigh || overBalance)
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-outline-variant/40 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
                }`}
              />
            </div>
            {show("amountETB") && noAmount && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Amount is required
              </p>
            )}
            {show("amountETB") && !noAmount && tooLow && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Minimum withdrawal is ETB 10
              </p>
            )}
            {show("amountETB") && !noAmount && tooHigh && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Maximum withdrawal is ETB 100,000
              </p>
            )}
            {show("amountETB") && !noAmount && overBalance && !tooHigh && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Exceeds your available balance of ETB {etb(availableETB * 100)}
              </p>
            )}
            {!show("amountETB") ||
            (!noAmount && !tooLow && !tooHigh && !overBalance) ? (
              <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 mt-1">
                Min: ETB 10 · Max: ETB 100,000
              </p>
            ) : null}
          </div>

          {accountLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-outline-variant/30 dark:border-zinc-700 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-on-surface dark:text-white">
                  Paying out to
                </span>
                <button
                  type="button"
                  onClick={onChangeAccount}
                  disabled={mutation.isPending}
                  className="font-semibold text-primary dark:text-green-400 hover:underline disabled:opacity-50"
                >
                  Change
                </button>
              </div>
              <p className="text-on-surface dark:text-zinc-200">
                {account?.bankName ?? "—"}
              </p>
              <p className="text-on-surface-variant dark:text-zinc-400">
                {account?.accountName ?? "—"}
              </p>
              <p className="font-mono text-on-surface dark:text-zinc-200">
                {account?.accountNumberMasked ??
                  (account?.accountNumberLast4
                    ? `•••• ${account.accountNumberLast4}`
                    : "—")}
              </p>
            </div>
          )}
          {holdActive && account?.holdUntil && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300/60 text-[11px] text-amber-900 dark:text-amber-200"
            >
              <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Withdrawals are on hold after a payout account change until{" "}
                <strong>{fmtDateTime(account.holdUntil)}</strong>.
              </span>
            </div>
          )}

          <div className="flex items-start gap-2.5 p-3 bg-surface-container-low dark:bg-zinc-800 rounded-xl">
            <Info className="h-4 w-4 text-on-surface-variant dark:text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 leading-relaxed">
              When you submit a request, we move that amount from your available
              balance into payout processing. Your balance already reflects
              Endebeto&apos;s platform fee.{" "}
              <strong className="text-on-surface dark:text-zinc-300">
                You can submit one new payout request every 7 days.
              </strong>
            </p>
          </div>
            </>
          )}
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-outline-variant/10 dark:border-zinc-700 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 text-on-surface dark:text-white text-sm font-medium hover:bg-surface dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              mutation.isPending ||
              mutation.isSuccess ||
              accountLoading ||
              noAccount ||
              holdActive
            }
            className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw{" "}
                {amount >= 10 ? `ETB ${amount.toLocaleString()}` : "Funds"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
