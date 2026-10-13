import { useEffect, useState, type Ref } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Clock, Landmark, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { isHoldActive, usePayoutAccount } from "@/hooks/usePayoutAccount";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { hostQueryKeys } from "@/lib/hostQueryKeys";
import { walletService } from "@/services/wallet.service";
import { PAYOUT_BANKS, fmtDateTime } from "./walletFormatters";

const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export function PayoutAccountCard({
  sectionRef,
  editing,
  onEditingChange,
  legalHostName,
}: {
  sectionRef?: Ref<HTMLElement>;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  legalHostName: string;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: account, isLoading, isError, refetch } = usePayoutAccount();

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // (Re)seed the form whenever it is opened.
  useEffect(() => {
    if (!editing) return;
    setBankName(account?.bankName ?? "");
    setAccountName(account?.accountName ?? legalHostName ?? "");
    setAccountNumber("");
    setCurrentPassword("");
    setOtp("");
    setOtpSent(false);
    setOtpCooldown(0);
    setSubmitAttempted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  // Resend cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const banks =
    account?.allowedBanks && account.allowedBanks.length > 0
      ? account.allowedBanks
      : [...PAYOUT_BANKS];
  const requiresPassword = !!account?.requiresPassword;
  const requiresOtp = !!account?.requiresOtp;
  const holdActive = isHoldActive(account?.holdUntil);

  const noBank = bankName === "";
  const noName = accountName.trim() === "";
  const nameMismatch =
    legalHostName.trim() !== "" &&
    !noName &&
    normalise(accountName) !== normalise(legalHostName);
  const numLen = accountNumber.length;
  const badNumber = numLen < 8 || numLen > 20;
  const noPassword = requiresPassword && currentPassword === "";
  const badOtp = requiresOtp && !/^\d{6}$/.test(otp.trim());
  const valid =
    !noBank && !noName && !nameMismatch && !badNumber && !noPassword && !badOtp;

  const sendOtpMutation = useMutation({
    mutationFn: () => walletService.sendPayoutAccountOtp(),
    onSuccess: () => {
      toast.success("Verification code sent to your email.");
      setOtpSent(true);
      setOtpCooldown(60);
    },
    onError: (err: unknown) => {
      toast.error(
        getFriendlyErrorMessage(
          err,
          "Failed to send verification code. Please try again.",
        ),
      );
    },
  });

  const mutation = useMutation({
    mutationFn: () =>
      walletService.savePayoutAccount({
        bankName,
        accountName: accountName.trim(),
        accountNumber,
        ...(requiresPassword ? { currentPassword } : {}),
        ...(requiresOtp ? { otp: otp.trim() } : {}),
      }),
    onSuccess: async () => {
      toast.success("Payout account saved.");
      await queryClient.invalidateQueries({
        queryKey: hostQueryKeys.wallet.payoutAccount(user?._id),
      });
      setAccountNumber("");
      setCurrentPassword("");
      setOtp("");
      onEditingChange(false);
    },
    onError: (err: unknown) => {
      toast.error(
        getFriendlyErrorMessage(
          err,
          "Could not save payout account. Please try again.",
        ),
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!valid) {
      toast.error("Please fix the errors in the form before saving.");
      return;
    }
    mutation.mutate();
  };

  const err = (show: boolean, msg: string) =>
    show ? (
      <p className="text-xs text-error mt-1 flex items-center gap-1" role="alert">
        <AlertCircle className="h-3 w-3" />
        {msg}
      </p>
    ) : null;

  return (
    <section
      ref={sectionRef}
      id="payout-account"
      className="scroll-mt-28 mb-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-outline-variant/15 dark:border-zinc-700 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-primary dark:text-green-400" />
          <h2 className="font-headline font-bold text-base text-on-surface dark:text-white">
            Payout account
          </h2>
        </div>
        {!editing && account && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEditingChange(true)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            {account.hasAccount ? "Edit" : "Add account"}
          </Button>
        )}
      </div>

      {holdActive && account?.holdUntil && (
        <Alert className="mb-5 border-amber-300/60 bg-amber-50 dark:bg-amber-900/20">
          <Clock className="h-4 w-4" />
          <AlertTitle>Withdrawals temporarily on hold</AlertTitle>
          <AlertDescription>
            You recently changed your payout account. For your security,
            withdrawals are blocked until{" "}
            <strong>{fmtDateTime(account.holdUntil)}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : isError || !account ? (
        <div className="text-sm text-on-surface-variant dark:text-zinc-400">
          Could not load your payout account.{" "}
          <button
            type="button"
            className="font-semibold text-primary underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      ) : editing ? (
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg" noValidate>
          {account.hasAccount && (
            <p className="text-xs text-on-surface-variant dark:text-zinc-400">
              Changing your payout account pauses withdrawals for a short
              security hold period.
            </p>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="payout-bank">Bank</Label>
            <Select value={bankName} onValueChange={setBankName}>
              <SelectTrigger id="payout-bank" aria-invalid={submitAttempted && noBank}>
                <SelectValue placeholder="Select your bank…" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err(submitAttempted && noBank, "Please select your bank")}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="payout-name">Account holder name</Label>
            <Input
              id="payout-name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Full name as on your bank account"
              autoComplete="off"
            />
            {err(submitAttempted && noName, "Account holder name is required")}
            {err(
              submitAttempted && !noName && nameMismatch,
              `Must match your host application legal name: ${legalHostName}`,
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="payout-number">Account number</Label>
            <Input
              id="payout-number"
              inputMode="numeric"
              className="font-mono"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Digits only (8–20)"
              maxLength={20}
              autoComplete="off"
            />
            {err(
              (submitAttempted || numLen > 0) && badNumber,
              "Account number must be 8–20 digits",
            )}
          </div>

          {requiresPassword && (
            <div className="grid gap-1.5">
              <Label htmlFor="payout-password">Current password</Label>
              <Input
                id="payout-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              {err(submitAttempted && noPassword, "Enter your current password")}
            </div>
          )}

          {requiresOtp && (
            <div className="grid gap-2 p-3.5 rounded-xl bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 dark:border-zinc-700">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="payout-otp" className="text-xs font-semibold">
                  Email verification code
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => sendOtpMutation.mutate()}
                  disabled={sendOtpMutation.isPending || otpCooldown > 0}
                  className="h-7 text-xs font-semibold text-primary dark:text-green-400"
                >
                  {sendOtpMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Sending…
                    </>
                  ) : otpCooldown > 0 ? (
                    `Resend in ${otpCooldown}s`
                  ) : otpSent ? (
                    "Resend code"
                  ) : (
                    "Send code to email"
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-on-surface-variant dark:text-zinc-400">
                To protect your account, we&apos;ll send a 6-digit verification code to{" "}
                <strong className="text-on-surface dark:text-white">
                  {user?.email}
                </strong>
                .
              </p>
              <Input
                id="payout-otp"
                inputMode="numeric"
                className="font-mono tracking-widest text-center text-base"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="••••••"
                maxLength={6}
                autoComplete="one-time-code"
              />
              {err(
                submitAttempted && badOtp,
                "Enter the 6-digit verification code sent to your email",
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onEditingChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Save payout account"
              )}
            </Button>
          </div>
        </form>
      ) : account.hasAccount ? (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-widest text-on-surface-variant dark:text-zinc-400">
              Bank
            </dt>
            <dd className="font-semibold text-on-surface dark:text-white mt-1">
              {account.bankName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-on-surface-variant dark:text-zinc-400">
              Account holder
            </dt>
            <dd className="font-semibold text-on-surface dark:text-white mt-1">
              {account.accountName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-on-surface-variant dark:text-zinc-400">
              Account number
            </dt>
            <dd className="font-mono font-semibold text-on-surface dark:text-white mt-1">
              {account.accountNumberMasked ??
                (account.accountNumberLast4
                  ? `•••• ${account.accountNumberLast4}`
                  : "—")}
            </dd>
          </div>
          {account.updatedAt && (
            <p className="sm:col-span-3 text-xs text-on-surface-variant dark:text-zinc-400">
              Last updated {fmtDateTime(account.updatedAt)}
            </p>
          )}
        </dl>
      ) : (
        <p className="text-sm text-on-surface-variant dark:text-zinc-400">
          No payout account saved yet. Add one to withdraw your earnings.
        </p>
      )}
    </section>
  );
}
