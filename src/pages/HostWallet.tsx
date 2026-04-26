import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Banknote, Wallet, ArrowDownToLine, FileText,
  ShieldCheck, Filter, Download,
  ChevronLeft, ChevronRight, X, AlertCircle,
  TrendingUp, Info, Loader2, ChevronDown, UserCheck, Clock, ArrowUpFromLine,
  TrendingDown, CheckCircle2, Search,
} from "lucide-react";
import HostLayout from "@/components/HostLayout";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { walletService, type WithdrawalRequest, type EarningRow } from "@/services/wallet.service";
import { getFriendlyErrorMessage } from "@/lib/errors";

/* ─── helpers ────────────────────────────────────────── */
const etb = (cents: number) =>
  (cents / 100).toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const PAGE_SIZE = 10;

/* ─── status config ──────────────────────────────────── */
const statusCfg: Record<string, { label: string; cls: string }> = {
  pending_transfer: { label: "Pending",  cls: "bg-[#ffddb8]/60 text-[#653e00] dark:bg-amber-900/40 dark:text-amber-300" },
  paid:             { label: "Paid",     cls: "bg-secondary-container text-on-secondary-fixed-variant dark:bg-emerald-900/40 dark:text-green-400" },
  failed:           { label: "Failed",   cls: "bg-error-container text-on-error-container dark:bg-red-900/40 dark:text-red-300" },
  canceled:         { label: "Cancelled",cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

/* ─── Ethiopian banks ────────────────────────────────── */
const ETHIOPIAN_BANKS = [
  "Abay Bank",
  "Ahadu Bank",
  "Awash Bank",
  "Bank of Abyssinia (BOA)",
  "Berhan Bank",
  "Birhan Bank",
  "Bunna International Bank",
  "Commercial Bank of Ethiopia (CBE)",
  "Cooperative Bank of Oromia (CBO)",
  "Dashen Bank",
  "Debub Global Bank",
  "Enat Bank",
  "Global Bank Ethiopia",
  "Hibret Bank",
  "Lion International Bank",
  "Nib International Bank",
  "Oromia Bank",
  "Tsehay Bank",
  "United Bank",
  "Wegagen Bank",
  "ZamZam Bank",
];

/* ─── withdraw modal ─────────────────────────────────── */
function WithdrawModal({
  availableETB,
  hostName,
  onClose,
  onSuccess,
}: {
  availableETB: number;
  hostName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    amountETB: "", bankName: "", accountName: hostName, accountNumber: "",
  });
  const [touched, setTouched] = useState({
    amountETB: false, bankName: false, accountName: false, accountNumber: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const clientRequestIdRef = useRef(
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `wr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  );

  const touch = (field: keyof typeof touched) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const amount      = parseFloat(form.amountETB) || 0;
  const tooLow      = amount > 0 && amount < 10;
  const tooHigh     = amount > 100_000;
  const overBalance = amount > availableETB;
  const noAmount    = form.amountETB.trim() === "";
  const noBank      = form.bankName === "";
  const noAccName   = form.accountName.trim() === "";
  const noAccNum    = form.accountNumber.trim().length < 8;
  const nonNumericAccNum = form.accountNumber.trim() !== "" && !/^\d+$/.test(form.accountNumber.trim());

  /* Account holder name must match registered name (case-insensitive trim) */
  const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const nameMismatch =
    form.accountName.trim() !== "" &&
    normalise(form.accountName) !== normalise(hostName);

  const valid =
    !noAmount && !tooLow && !tooHigh && !overBalance &&
    !noBank &&
    !noAccName && !nameMismatch &&
    !noAccNum && !nonNumericAccNum;

  /* Show field error only if touched or submit was attempted */
  const show = (field: keyof typeof touched) => touched[field] || submitAttempted;

  const mutation = useMutation({
    mutationFn: () =>
      walletService.createWithdrawal({
        amountETB:     amount,
        bankName:      form.bankName,
        accountName:   form.accountName.trim(),
        accountNumber: form.accountNumber.trim(),
        clientRequestId: clientRequestIdRef.current,
      }),
    onSuccess: () => {
      setSubmitted(true);
      onSuccess();
    },
    onError: (err: unknown) => {
      toast.error(
        getFriendlyErrorMessage(err, "Failed to submit withdrawal request. Please try again."),
        { duration: 6000 },
      );
    },
  });

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!valid) {
      toast.error("Please fix the errors in the form before submitting.", { duration: 4000 });
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 w-full max-w-md max-h-[90vh] flex flex-col">

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary-container/50 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-7 w-7 text-primary dark:text-green-400" />
            </div>
            <h3 className="font-headline font-extrabold text-lg text-primary dark:text-green-400 mb-2">Withdrawal Submitted</h3>
            <p className="text-sm text-on-surface-variant dark:text-zinc-400 leading-relaxed mb-2">
              Your withdrawal of <strong className="text-on-surface dark:text-white">ETB {amount.toLocaleString("en-ET", { minimumFractionDigits: 2 })}</strong> has been submitted to <strong className="text-on-surface dark:text-white">{form.bankName}</strong>.
            </p>
            <p className="text-xs text-on-surface-variant dark:text-zinc-500 mb-6">
              The amount has been deducted from your available balance and is now in pending payout. Funds are typically processed within 3–5 business days.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10 dark:border-zinc-700 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ffddb8]/60 flex items-center justify-center">
                  <ArrowDownToLine className="h-4 w-4 text-[#653e00]" />
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface dark:text-white">Withdraw Funds</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-zinc-800 text-on-surface-variant transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">

              {/* Available balance hint */}
              <div className="flex items-center justify-between p-3 bg-surface-container-low dark:bg-zinc-800 rounded-xl text-xs">
                <span className="text-on-surface-variant dark:text-zinc-400">Available to withdraw</span>
                <span className="font-bold text-primary dark:text-green-400">ETB {etb(availableETB * 100)}</span>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                  Amount (ETB) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant dark:text-zinc-400">ETB</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    min={10}
                    max={100000}
                    value={form.amountETB}
                    onChange={(e) => setForm((p) => ({ ...p, amountETB: e.target.value }))}
                    onBlur={() => touch("amountETB")}
                    className={`w-full pl-14 pr-4 py-3 rounded-xl border text-on-surface dark:text-white text-sm font-semibold outline-none focus:ring-2 transition-all bg-white dark:bg-zinc-800 ${
                      show("amountETB") && (noAmount || tooLow || tooHigh || overBalance)
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-outline-variant/40 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {show("amountETB") && noAmount    && <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Amount is required</p>}
                {show("amountETB") && !noAmount && tooLow    && <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Minimum withdrawal is ETB 10</p>}
                {show("amountETB") && !noAmount && tooHigh   && <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Maximum withdrawal is ETB 100,000</p>}
                {show("amountETB") && !noAmount && overBalance && !tooHigh && <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Exceeds your available balance of ETB {etb(availableETB * 100)}</p>}
                {!show("amountETB") || (!noAmount && !tooLow && !tooHigh && !overBalance) ? (
                  <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 mt-1">Min: ETB 10 · Max: ETB 100,000</p>
                ) : null}
              </div>

              {/* Bank name — dropdown */}
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                  Bank <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.bankName}
                    onChange={(e) => { setForm((p) => ({ ...p, bankName: e.target.value })); touch("bankName"); }}
                    onBlur={() => touch("bankName")}
                    className={`w-full appearance-none px-4 py-3 pr-10 rounded-xl border text-on-surface dark:text-white text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-zinc-800 ${
                      show("bankName") && noBank
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-outline-variant/40 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
                    }`}
                  >
                    <option value="">Select your bank…</option>
                    {ETHIOPIAN_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant dark:text-zinc-400" />
                </div>
                {show("bankName") && noBank && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Please select your bank</p>
                )}
              </div>

              {/* Account holder name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                  Account Holder Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full name as on your bank account"
                  value={form.accountName}
                  onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))}
                  onBlur={() => touch("accountName")}
                  className={`w-full px-4 py-3 rounded-xl border text-on-surface dark:text-white text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-zinc-800 ${
                    show("accountName") && (noAccName || nameMismatch)
                      ? "border-error focus:border-error focus:ring-error/20"
                      : "border-outline-variant/40 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
                  }`}
                />
                {show("accountName") && noAccName && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Account holder name is required</p>
                )}
                {show("accountName") && !noAccName && nameMismatch && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Name must match your registered host name: <strong className="ml-1">{hostName}</strong></p>
                )}
                {/* Guidance notice */}
                <div className="flex items-start gap-2 mt-2 p-2.5 bg-secondary-container/20 dark:bg-emerald-900/20 rounded-lg border border-secondary-container/40 dark:border-emerald-800/30">
                  <UserCheck className="h-3.5 w-3.5 text-primary dark:text-green-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-primary dark:text-green-400 leading-relaxed font-medium">
                    Your bank account holder name must exactly match your registered host name: <strong>{hostName}</strong>
                  </p>
                </div>
              </div>

              {/* Account number */}
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                  Account Number <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter your full account number"
                  value={form.accountNumber}
                  onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value.replace(/\D/g, "") }))}
                  onBlur={() => touch("accountNumber")}
                  className={`w-full px-4 py-3 rounded-xl border text-on-surface dark:text-white text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-zinc-800 font-mono ${
                    show("accountNumber") && (noAccNum || nonNumericAccNum)
                      ? "border-error focus:border-error focus:ring-error/20"
                      : "border-outline-variant/40 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
                  }`}
                />
                {show("accountNumber") && noAccNum && !nonNumericAccNum && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Account number must be at least 8 digits</p>
                )}
                {show("accountNumber") && nonNumericAccNum && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Account number must contain digits only</p>
                )}
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-2.5 p-3 bg-surface-container-low dark:bg-zinc-800 rounded-xl">
                <Info className="h-4 w-4 text-on-surface-variant dark:text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                  The requested amount is <strong>immediately deducted</strong> from your available balance and moved to pending payout. Endebeto's 15% platform fee has already been applied to your balance.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-5 border-t border-outline-variant/10 dark:border-zinc-700 shrink-0">
              <button
                onClick={onClose}
                disabled={mutation.isPending}
                className="flex-1 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 text-on-surface dark:text-white text-sm font-medium hover:bg-surface dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
                ) : (
                  <><ArrowDownToLine className="h-4 w-4" />Withdraw {amount >= 10 ? `ETB ${amount.toLocaleString()}` : "Funds"}</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── transaction row ────────────────────────────────── */
function TxRow({ w }: { w: WithdrawalRequest }) {
  const cfg = statusCfg[w.status] ?? statusCfg.pending_transfer;
  const dest = w.destination;
  const desc = dest
    ? `${dest.bankName ?? "Bank"} · ${dest.accountName ?? ""} ****${dest.accountNumberLast4 ?? "****"}`
    : "Withdrawal";

  return (
    <tr className="hover:bg-surface-container-low/30 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="px-8 py-5 text-sm font-medium text-on-surface-variant dark:text-zinc-400 whitespace-nowrap">
        {fmtDate(w.createdAt)}
      </td>
      <td className="px-4 py-5 text-sm font-mono text-outline dark:text-zinc-500 whitespace-nowrap">
        #{w._id.slice(-8).toUpperCase()}
      </td>
      <td className="px-4 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ffddb8]/40 dark:bg-amber-900/30 flex items-center justify-center">
            <Wallet className="h-3.5 w-3.5 text-[#653e00] dark:text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-on-surface dark:text-white">Withdrawal</span>
        </div>
      </td>
      <td className="px-4 py-5 text-xs text-on-surface-variant dark:text-zinc-400 max-w-[200px] truncate">
        {desc}
      </td>
      <td className="px-4 py-5 text-sm font-bold text-error dark:text-red-400 whitespace-nowrap">
        −ETB {etb(w.amountCents)}
      </td>
      <td className="px-4 py-5 whitespace-nowrap">
        {w.status === "paid" && w.paymentReceiptUrl ? (
          <a
            href={w.paymentReceiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-green-400 hover:underline"
          >
            Receipt
          </a>
        ) : (
          <span className="text-[10px] text-on-surface-variant dark:text-zinc-500">—</span>
        )}
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.cls}`}>
          {cfg.label}
        </span>
      </td>
    </tr>
  );
}

/* ─── earning row ────────────────────────────────────── */
function EarningRowComponent({ row }: { row: EarningRow }) {
  const isHeld     = row.status === "held";
  const initials   = (name?: string) =>
    (name ?? "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <tr className="hover:bg-surface-container-low/30 dark:hover:bg-zinc-800/30 transition-colors">
      {/* Date */}
      <td className="px-8 py-5 text-sm text-on-surface-variant dark:text-zinc-400 whitespace-nowrap">
        {fmtDate(row.date)}
      </td>

      {/* Experience */}
      <td className="px-4 py-5">
        <div className="flex items-center gap-2.5 min-w-0">
          {row.booking?.experience?.imageCover ? (
            <img
              src={row.booking.experience.imageCover}
              alt={row.booking.experience.title}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-surface-container dark:bg-zinc-700 shrink-0" />
          )}
          <span className="text-xs font-semibold text-on-surface dark:text-white truncate max-w-[160px]">
            {row.booking?.experience?.title ?? "—"}
          </span>
        </div>
      </td>

      {/* Guest */}
      <td className="px-4 py-5">
        <div className="flex items-center gap-2">
          {row.booking?.guest?.photo ? (
            <img src={row.booking.guest.photo} alt={row.booking.guest.name}
              className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-secondary-container dark:bg-emerald-900/50 flex items-center justify-center text-[9px] font-bold text-primary dark:text-green-400 shrink-0">
              {initials(row.booking?.guest?.name)}
            </div>
          )}
          <span className="text-xs text-on-surface-variant dark:text-zinc-400 truncate max-w-[100px]">
            {row.booking?.guest?.name ?? "—"}
          </span>
        </div>
      </td>

      {/* Gross */}
      <td className="px-4 py-5 text-xs text-on-surface-variant dark:text-zinc-400 whitespace-nowrap">
        ETB {etb(row.grossCents)}
      </td>

      {/* Fee */}
      <td className="px-4 py-5 text-xs text-error dark:text-red-400 whitespace-nowrap">
        −ETB {etb(row.feeCents)}
      </td>

      {/* Net */}
      <td className="px-4 py-5 text-sm font-bold text-primary dark:text-green-400 whitespace-nowrap">
        ETB {etb(row.netCents)}
      </td>

      {/* Status */}
      <td className="px-8 py-5 whitespace-nowrap">
        {isHeld ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 uppercase">
            <Clock className="h-2.5 w-2.5" /> Held
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container dark:bg-emerald-900/40 text-on-secondary-fixed-variant dark:text-green-400 uppercase">
            <CheckCircle2 className="h-2.5 w-2.5" /> Released
          </span>
        )}
      </td>
    </tr>
  );
}

/* ─── main component ─────────────────────────────────── */
export default function HostWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch]       = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [activeTab, setActiveTab] = useState<"earnings" | "withdrawals">("earnings");
  const [earningsPage, setEarningsPage] = useState(1);

  const WITHDRAWALS_FETCH_LIMIT = 200;

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["my-wallet"],
    queryFn: () => walletService.getWallet(),
    staleTime: 30_000,
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: () =>
      walletService.getWithdrawals({ page: 1, limit: WITHDRAWALS_FETCH_LIMIT }),
    staleTime: 30_000,
  });

  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ["my-earnings", earningsPage],
    queryFn: () => walletService.getEarnings({ page: earningsPage, limit: PAGE_SIZE }),
    staleTime: 30_000,
  });

  const wallet      = walletData?.data.data.wallet;
  const withdrawals: WithdrawalRequest[] = withdrawalsData?.data.data.withdrawals ?? [];
  const totalW      = withdrawalsData?.data.total ?? withdrawals.length;

  const earnings: EarningRow[] = earningsData?.data.data.earnings ?? [];
  const totalE      = earningsData?.data.total ?? 0;
  const totalEPages = Math.ceil(totalE / PAGE_SIZE);

  const availableETB = wallet ? wallet.availableBalanceCents / 100 : 0;

  const withdrawalMatchesSearch = (w: WithdrawalRequest, qRaw: string) => {
    const q = qRaw.trim().toLowerCase();
    if (!q) return true;
    const dest = w.destination;
    return (
      w._id.toLowerCase().includes(q) ||
      (dest?.bankName ?? "").toLowerCase().includes(q) ||
      (dest?.accountName ?? "").toLowerCase().includes(q)
    );
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending_transfer");
  const historyWithdrawals = withdrawals.filter(
    (w) => w.status === "paid" || w.status === "failed" || w.status === "canceled"
  );

  const filteredPending = search
    ? pendingWithdrawals.filter((w) => withdrawalMatchesSearch(w, search))
    : pendingWithdrawals;
  const filteredHistory = search
    ? historyWithdrawals.filter((w) => withdrawalMatchesSearch(w, search))
    : historyWithdrawals;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["my-wallet"] });
    void queryClient.invalidateQueries({ queryKey: ["my-withdrawals"] });
    void queryClient.invalidateQueries({ queryKey: ["my-earnings"] });
  };

  return (
    <HostLayout
      hostName={user?.name ?? "Host"}
      hostTitle="Host"
    >
      {showWithdraw && (
        <WithdrawModal
          availableETB={availableETB}
          hostName={user?.name ?? ""}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => { setShowWithdraw(false); invalidateAll(); }}
        />
      )}

      <main className="p-10 max-w-[1440px]">

        {/* ── Page Header ──────────────────────────────── */}
        <header className="mb-10">
          <h1 className="text-3xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight">Host Wallet</h1>
          <p className="text-on-surface-variant dark:text-zinc-400 mt-1">Manage your earnings, payouts, and financial history.</p>
        </header>

        {/* ── Balance cards ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

          {/* Available Balance */}
          <div className="lg:col-span-1 relative overflow-hidden bg-primary-container dark:bg-[#064e3b] p-8 rounded-2xl text-white shadow-lg flex flex-col justify-between min-h-[220px]">
            <div className="absolute right-[-10%] bottom-[-20%] w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(0,53,39,0.4)" }} />
            <div className="absolute right-[5%] top-[-10%]  w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(76,99,89,0.2)" }} />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 opacity-70" />
                <span className="text-white/70 font-semibold text-xs uppercase tracking-widest">Available Balance</span>
              </div>
              {walletLoading ? (
                <div className="flex items-center gap-2 mt-3">
                  <Loader2 className="h-6 w-6 animate-spin text-white/60" />
                  <span className="text-white/60 text-sm">Loading…</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-headline font-black tracking-tighter">{etb(wallet?.availableBalanceCents ?? 0)}</span>
                    <span className="text-xl font-bold opacity-60">ETB</span>
                  </div>
                  <p className="text-white/60 text-xs mt-2 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Ready to withdraw — 15% platform fee already deducted
                  </p>
                  {(wallet?.totalEarnedCents ?? 0) > 0 && (
                    <p className="text-white/40 text-[11px] mt-1">
                      Gross earned: ETB {etb(wallet!.totalEarnedCents + wallet!.totalFeesCents)} &nbsp;·&nbsp; Fee: ETB {etb(wallet!.totalFeesCents)}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={() => setShowWithdraw(true)}
                disabled={availableETB < 10}
                className="px-7 py-3 bg-[#ffddb8] text-[#2a1700] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw Funds
              </button>
              <button className="px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors rounded-xl font-bold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 opacity-70" />
                View Statement
              </button>
            </div>
          </div>

          {/* Held Earnings (not yet withdrawable) */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-outline-variant/15 dark:border-zinc-700 border-l-4 border-l-amber-400 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span className="text-on-surface-variant dark:text-zinc-400 font-semibold text-xs uppercase tracking-widest">Held Earnings</span>
              </div>
              {walletLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-amber-500 mt-2" />
              ) : (
                <div className="flex items-baseline gap-2 text-amber-600 dark:text-amber-400 mt-1">
                  <span className="text-3xl font-headline font-black tracking-tighter">{etb(wallet?.heldEarningsCents ?? 0)}</span>
                  <span className="text-base font-bold opacity-60">ETB</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 mt-4 leading-relaxed">
              Paid by guests — released to your available balance once the experience date passes.
            </p>
          </div>

          {/* Payout in Transit (withdrawal requested) */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-outline-variant/15 dark:border-zinc-700 border-l-4 border-l-blue-400 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpFromLine className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span className="text-on-surface-variant dark:text-zinc-400 font-semibold text-xs uppercase tracking-widest">In Transit</span>
              </div>
              {walletLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-2" />
              ) : (
                <div className="flex items-baseline gap-2 text-blue-600 dark:text-blue-400 mt-1">
                  <span className="text-3xl font-headline font-black tracking-tighter">{etb(wallet?.payoutInTransitCents ?? 0)}</span>
                  <span className="text-base font-bold opacity-60">ETB</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 mt-4 leading-relaxed">
              Money for pending bank transfers — typically arrives in 3–5 business days. Each request stays in your history.
            </p>
          </div>
        </div>

        {/* ── History Tabs ──────────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-outline-variant/10 dark:border-zinc-700 overflow-hidden">

          {/* Tab bar */}
          <div className="px-8 py-0 flex items-center justify-between border-b border-outline-variant/10 dark:border-zinc-700">
            <div className="flex">
              {(["earnings", "withdrawals"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-primary text-primary dark:border-green-400 dark:text-green-400"
                      : "border-transparent text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-green-400"
                  }`}
                >
                  {tab === "earnings" ? (
                    <span className="flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5" />
                      Earnings {totalE > 0 && <span className="bg-primary/10 dark:bg-green-900/40 text-primary dark:text-green-400 rounded-full px-1.5 py-0.5 text-[9px]">{totalE}</span>}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <ArrowUpFromLine className="h-3.5 w-3.5" />
                      Withdrawals {totalW > 0 && <span className="bg-primary/10 dark:bg-green-900/40 text-primary dark:text-green-400 rounded-full px-1.5 py-0.5 text-[9px]">{totalW}</span>}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search — withdrawals only */}
            {activeTab === "withdrawals" && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-on-surface-variant dark:text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search withdrawals…"
                  className="pl-8 pr-3 py-1.5 bg-surface-container-low dark:bg-zinc-800 rounded-lg text-xs border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500 w-48"
                />
              </div>
            )}
          </div>

          {/* ── Earnings Tab ── */}
          {activeTab === "earnings" && (
            <>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left min-w-[680px]">
                  <thead>
                    <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-8 py-4">Date</th>
                      <th className="px-4 py-4">Experience</th>
                      <th className="px-4 py-4">Guest</th>
                      <th className="px-4 py-4">Gross</th>
                      <th className="px-4 py-4">Fee (15%)</th>
                      <th className="px-4 py-4">You Receive</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 dark:divide-zinc-800">
                    {earningsLoading ? (
                      <tr><td colSpan={7} className="px-8 py-12 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-green-400 mx-auto" />
                      </td></tr>
                    ) : earnings.length === 0 ? (
                      <tr><td colSpan={7} className="px-8 py-12 text-center text-sm text-on-surface-variant dark:text-zinc-400">
                        No earnings yet — earnings appear here when guests book your experiences.
                      </td></tr>
                    ) : (
                      earnings.map((row) => <EarningRowComponent key={row._id} row={row} />)
                    )}
                  </tbody>
                </table>
              </div>

              {totalEPages > 1 && (
                <div className="px-8 py-5 border-t border-outline-variant/10 dark:border-zinc-700 flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant dark:text-zinc-400">
                    Page {earningsPage} of {totalEPages} · {totalE} total
                  </span>
                  <div className="flex items-center gap-1">
                    <button disabled={earningsPage === 1} onClick={() => setEarningsPage(p => p - 1)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-primary dark:text-green-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </button>
                    {Array.from({ length: Math.min(totalEPages, 5) }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setEarningsPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === earningsPage ? "bg-primary text-white dark:bg-green-600" : "text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800"}`}>
                        {p}
                      </button>
                    ))}
                    <button disabled={earningsPage === totalEPages} onClick={() => setEarningsPage(p => p + 1)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-primary dark:text-green-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Withdrawals Tab (pending vs history — each request is its own row) ── */}
          {activeTab === "withdrawals" && (
            <>
              <p className="px-8 py-3 text-[11px] text-on-surface-variant dark:text-zinc-500 border-b border-outline-variant/10 dark:border-zinc-700 leading-relaxed">
                Each payout request is kept on file. Requesting a new withdrawal adds a row — it does not replace completed or failed payouts.
              </p>

              {withdrawalsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-green-400" />
                </div>
              ) : (
                <>
                  <div className="px-8 py-3 bg-amber-50/70 dark:bg-amber-950/25 border-b border-outline-variant/10 dark:border-zinc-800">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-900 dark:text-amber-400">
                      Pending requests ({filteredPending.length})
                    </h3>
                    <p className="text-[10px] text-on-surface-variant dark:text-zinc-500 mt-0.5">
                      In queue for bank transfer
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                          <th className="px-8 py-4">Date</th>
                          <th className="px-4 py-4">Reference</th>
                          <th className="px-4 py-4">Type</th>
                          <th className="px-4 py-4">Destination</th>
                          <th className="px-4 py-4">Amount</th>
                          <th className="px-4 py-4">Receipt</th>
                          <th className="px-8 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 dark:divide-zinc-800">
                        {filteredPending.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-8 py-8 text-center text-sm text-on-surface-variant dark:text-zinc-400">
                              {search ? "No pending withdrawals match your search." : "No pending withdrawals."}
                            </td>
                          </tr>
                        ) : (
                          filteredPending.map((w) => <TxRow key={w._id} w={w} />)
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-8 py-3 bg-surface-container-low/60 dark:bg-zinc-800/40 border-t border-b border-outline-variant/10 dark:border-zinc-800">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary dark:text-green-400">
                      Withdrawal history ({filteredHistory.length})
                    </h3>
                    <p className="text-[10px] text-on-surface-variant dark:text-zinc-500 mt-0.5">
                      Paid, failed, or cancelled — permanent record
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                          <th className="px-8 py-4">Date</th>
                          <th className="px-4 py-4">Reference</th>
                          <th className="px-4 py-4">Type</th>
                          <th className="px-4 py-4">Destination</th>
                          <th className="px-4 py-4">Amount</th>
                          <th className="px-4 py-4">Receipt</th>
                          <th className="px-8 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 dark:divide-zinc-800">
                        {filteredHistory.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-8 py-8 text-center text-sm text-on-surface-variant dark:text-zinc-400">
                              {search ? "No past withdrawals match your search." : "No completed withdrawals yet."}
                            </td>
                          </tr>
                        ) : (
                          filteredHistory.map((w) => <TxRow key={w._id} w={w} />)
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalW > WITHDRAWALS_FETCH_LIMIT && (
                    <p className="px-8 py-3 text-[10px] text-amber-700 dark:text-amber-400 border-t border-outline-variant/10 dark:border-zinc-700">
                      Showing the {WITHDRAWALS_FETCH_LIMIT} most recent of {totalW} requests. Ask support if you need a full statement.
                    </p>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </main>
    </HostLayout>
  );
}
