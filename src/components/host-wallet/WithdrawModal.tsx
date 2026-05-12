import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  X,
  AlertCircle,
  Info,
  Loader2,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { walletService } from "@/services/wallet.service";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { etb, PAYOUT_BANKS } from "./walletFormatters";

export function WithdrawModal({
  availableETB,
  accountHolderLegalName,
  savedBankName,
  savedAccountName,
  savedAccountNumber,
  onClose,
  onWithdrawComplete,
}: {
  availableETB: number;
  accountHolderLegalName: string;
  savedBankName?: string;
  savedAccountName?: string;
  savedAccountNumber?: string;
  onClose: () => void;
  onWithdrawComplete: () => Promise<void>;
}) {
  const presetHolder =
    savedAccountName?.trim() || accountHolderLegalName.trim() || "";

  const [form, setForm] = useState({
    amountETB: "",
    bankName: savedBankName ?? "",
    accountName: presetHolder,
    accountNumber: (savedAccountNumber ?? "").replace(/\D/g, ""),
  });
  const [touched, setTouched] = useState({
    amountETB: false,
    bankName: false,
    accountName: false,
    accountNumber: false,
  });
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
  const noBank = form.bankName === "";
  const noAccName = form.accountName.trim() === "";
  const noAccNum = form.accountNumber.trim().length < 8;
  const nonNumericAccNum =
    form.accountNumber.trim() !== "" &&
    !/^\d+$/.test(form.accountNumber.trim());

  const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const legalRef = accountHolderLegalName.trim();
  const nameMismatch =
    legalRef !== "" &&
    form.accountName.trim() !== "" &&
    normalise(form.accountName) !== normalise(legalRef);

  const valid =
    !noAmount &&
    !tooLow &&
    !tooHigh &&
    !overBalance &&
    !noBank &&
    !noAccName &&
    !nameMismatch &&
    !noAccNum &&
    !nonNumericAccNum;

  const show = (field: keyof typeof touched) =>
    touched[field] || submitAttempted;

  const mutation = useMutation({
    mutationFn: () =>
      walletService.createWithdrawal({
        amountETB: amount,
        bankName: form.bankName,
        accountName: form.accountName.trim(),
        accountNumber: form.accountNumber.trim(),
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

  const handleSubmit = () => {
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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10 dark:border-zinc-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffddb8]/60 flex items-center justify-center">
              <ArrowDownToLine className="h-4 w-4 text-[#653e00]" />
            </div>
            <h3 className="font-headline font-bold text-base text-on-surface dark:text-white">
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

          <div>
            <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
              Bank <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                value={form.bankName}
                onChange={(e) => {
                  setForm((p) => ({ ...p, bankName: e.target.value }));
                  touch("bankName");
                }}
                onBlur={() => touch("bankName")}
                className={`w-full appearance-none px-4 py-3 pr-10 rounded-xl border text-on-surface dark:text-white text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-zinc-800 ${
                  show("bankName") && noBank
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-outline-variant/40 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
                }`}
              >
                <option value="">Select your bank…</option>
                {PAYOUT_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant dark:text-zinc-400" />
            </div>
            {show("bankName") && noBank && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Please select your bank
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
              Account Holder Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="Full name as on your bank account"
              value={form.accountName}
              onChange={(e) =>
                setForm((p) => ({ ...p, accountName: e.target.value }))
              }
              onBlur={() => touch("accountName")}
              className={`w-full px-4 py-3 rounded-xl border text-on-surface dark:text-white text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-zinc-800 ${
                show("accountName") && (noAccName || nameMismatch)
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-outline-variant/40 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {show("accountName") && noAccName && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Account holder name is required
              </p>
            )}
            {show("accountName") && !noAccName && nameMismatch && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Must match your host application legal name:{" "}
                <strong className="ml-1">{legalRef}</strong>
              </p>
            )}
            <div className="flex items-start gap-2 mt-2 p-2.5 bg-secondary-container/20 dark:bg-emerald-900/20 rounded-lg border border-secondary-container/40 dark:border-emerald-800/30">
              <UserCheck className="h-3.5 w-3.5 text-primary dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary dark:text-green-400 leading-relaxed font-medium">
                {legalRef ? (
                  savedAccountName?.trim() ? (
                    <>
                      Using your <strong>saved payout account name</strong>. It
                      must exactly match your approved host application legal
                      name: <strong>{legalRef}</strong>.
                    </>
                  ) : (
                    <>
                      Pre-filled from your approved host application. The
                      account holder name must match:{" "}
                      <strong>{legalRef}</strong>. You can save bank details
                      for next time by submitting a withdrawal.
                    </>
                  )
                ) : (
                  <>
                    Use the same full name as on your approved host application
                    (your display name can differ). If this field is empty,
                    refresh the page and try again.
                  </>
                )}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
              Account Number <span className="text-error">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter your full account number"
              value={form.accountNumber}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  accountNumber: e.target.value.replace(/\D/g, ""),
                }))
              }
              onBlur={() => touch("accountNumber")}
              className={`w-full px-4 py-3 rounded-xl border text-on-surface dark:text-white text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-zinc-800 font-mono ${
                show("accountNumber") && (noAccNum || nonNumericAccNum)
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-outline-variant/40 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {show("accountNumber") && noAccNum && !nonNumericAccNum && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Account number must be at least 8 digits
              </p>
            )}
            {show("accountNumber") && nonNumericAccNum && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Account number must contain digits only
              </p>
            )}
          </div>

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
            disabled={mutation.isPending}
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
