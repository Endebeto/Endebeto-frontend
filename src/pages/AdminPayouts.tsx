import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Download, Wallet, Clock, AlertCircle,
  ChevronLeft, ChevronRight, History, Lightbulb, X, Loader2, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { adminService, type AdminWithdrawal } from "@/services/admin.service";

/* ─── types ──────────────────────────────────────────────── */
type PayoutStatus = "pending_transfer" | "paid" | "failed";

/* ─── status styles ──────────────────────────────────────── */
const STATUS: Record<PayoutStatus, { pill: string; dot: string; label: string }> = {
  pending_transfer: { pill: "bg-tertiary-fixed text-on-tertiary-fixed",           dot: "bg-on-tertiary-container", label: "Pending"  },
  paid:             { pill: "bg-secondary-container text-on-secondary-container", dot: "bg-on-primary-container",  label: "Paid"     },
  failed:           { pill: "bg-error-container text-on-error-container",         dot: "bg-error",                 label: "Failed"   },
};

const PAGE_SIZE = 10;

function initials(name: string) {
  return name?.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() ?? "??";
}

function fmtETB(cents: number) {
  return (cents / 100).toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Bank + account for payout — request snapshot + host profile on file */
function bankDetailsForPayout(wr: AdminWithdrawal): {
  bank: string;
  accountName: string;
  accountNumber: string;
} {
  const dest = wr.destination;
  const host = wr.host;
  const bank =
    dest?.bankName ??
    host?.hostPayoutBankName ??
    wr.bankName ??
    "—";
  const accountName =
    dest?.accountName ?? host?.cbeAccountName ?? wr.accountName ?? "—";
  const full =
    dest?.accountNumber?.replace(/\s/g, "") ||
    host?.cbeAccountNumber?.replace(/\s/g, "") ||
    wr.accountNumber?.replace(/\s/g, "") ||
    "";
  const last4 = dest?.accountNumberLast4 ?? (full ? full.slice(-4) : "");
  const accountNumber =
    full.length >= 4
      ? full
      : last4
        ? `****${last4}`
        : "—";
  return { bank, accountName, accountNumber };
}

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function matchesWithdrawalSearch(w: AdminWithdrawal, q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return (
    (w.host?.name ?? "").toLowerCase().includes(s) ||
    (w.bankName ?? "").toLowerCase().includes(s)
  );
}

function sortHistoryDesc(a: AdminWithdrawal, b: AdminWithdrawal) {
  const ta = new Date(a.processedAt ?? a.createdAt).getTime();
  const tb = new Date(b.processedAt ?? b.createdAt).getTime();
  return tb - ta;
}

function MarkPaidModal({
  wr,
  onClose,
  onConfirm,
  loading,
}: {
  wr: AdminWithdrawal;
  onClose: () => void;
  onConfirm: (id: string, paymentReceiptUrl: string) => void;
  loading?: boolean;
}) {
  const [receiptUrl, setReceiptUrl] = useState("");
  const bank = bankDetailsForPayout(wr);
  const receiptOk = isValidHttpUrl(receiptUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/20 dark:border-zinc-700">
        <div className="shrink-0 flex items-start justify-between px-6 pt-6 pb-2">
          <h3 className="font-headline font-extrabold text-lg text-primary dark:text-emerald-400">Mark as paid</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-low dark:hover:bg-zinc-800 text-on-surface-variant">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
          <p className="text-xs text-on-surface-variant dark:text-zinc-400">
            Confirm transfer to <strong className="text-on-surface dark:text-zinc-200">{wr.host?.name}</strong> for{" "}
            <strong className="text-on-surface dark:text-zinc-200">ETB {fmtETB(wr.amountCents ?? 0)}</strong>.
          </p>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/50 dark:bg-zinc-800/80 p-3 space-y-1.5 text-xs">
            <p>
              <span className="text-on-surface-variant">Bank: </span>
              <span className="font-semibold text-on-surface dark:text-zinc-200">{bank.bank}</span>
            </p>
            <p>
              <span className="text-on-surface-variant">Account name: </span>
              <span className="font-semibold text-on-surface dark:text-zinc-200">{bank.accountName}</span>
            </p>
            <p>
              <span className="text-on-surface-variant">Account no.: </span>
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">{bank.accountNumber}</span>
            </p>
          </div>
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
              Payment receipt link <span className="text-error">(required)</span>
            </label>
            <input
              type="url"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://… link to receipt or proof of transfer"
              className="w-full bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            {receiptUrl.trim() !== "" && !receiptOk && (
              <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">Enter a valid URL starting with http:// or https://</p>
            )}
            <p className="text-[10px] text-on-surface-variant dark:text-zinc-500 mt-2 leading-relaxed">
              Hosts will see this link in their wallet after you confirm. Use a stable URL (e.g. uploaded receipt or bank portal screenshot).
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

/* ─── Mark-Failed Modal ──────────────────────────────────── */
function FailModal({ wr, onClose, onConfirm, loading }: {
  wr: AdminWithdrawal;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
  loading?: boolean;
}) {
  const [reason, setReason] = useState("Invalid Account Number");
  const [note, setNote]     = useState("");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/20 dark:border-zinc-700">
        <div className="shrink-0 flex items-start justify-between px-6 pt-6 pb-2">
          <h3 className="font-headline font-extrabold text-lg text-red-700 dark:text-red-400">Mark Payout as Failed</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-low dark:hover:bg-zinc-800 text-on-surface-variant">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-4">
            Specify the reason for failure for <strong className="text-on-surface dark:text-zinc-200">{wr.host?.name}</strong>. This will be visible to the host.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">Reason Code</label>
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
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">Internal Note</label>
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
          <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-3 rounded-xl border border-outline-variant/50 dark:border-zinc-600 text-on-surface dark:text-zinc-200 font-headline font-bold text-sm hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(wr._id, `${reason}${note ? ": " + note : ""}`)}
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

/* ─── page ───────────────────────────────────────────────── */
export default function AdminPayouts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [failTarget, setFailTarget] = useState<AdminWithdrawal | null>(null);
  const [paidTarget, setPaidTarget] = useState<AdminWithdrawal | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: () =>
      adminService.getWithdrawals({}).then(r => r.data.data.withdrawals),
    staleTime: 30_000,
  });

  const withdrawals: AdminWithdrawal[] = data ?? [];

  const historyRows = withdrawals
    .filter(w => w.status === "paid" || w.status === "failed")
    .filter(w => matchesWithdrawalSearch(w, search))
    .sort(sortHistoryDesc);

  const pendingRows = withdrawals
    .filter(w => w.status === "pending_transfer")
    .filter(w => matchesWithdrawalSearch(w, search))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const historyTotalPages = Math.max(1, Math.ceil(historyRows.length / PAGE_SIZE));
  const pendingTotalPages = Math.max(1, Math.ceil(pendingRows.length / PAGE_SIZE));
  const historyPaginated = historyRows.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);
  const pendingPaginated = pendingRows.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);

  const pendingItems  = withdrawals.filter(w => w.status === "pending_transfer");
  const pendingCount  = pendingItems.length;
  const pendingAmount = pendingItems.reduce((s, w) => s + (w.amountCents ?? 0), 0);
  const failedCount   = withdrawals.filter(w => w.status === "failed").length;
  const paidTotal     = withdrawals.filter(w => w.status === "paid").reduce((s, w) => s + (w.amountCents ?? 0), 0);

  const markPaidMutation = useMutation({
    mutationFn: ({ id, paymentReceiptUrl }: { id: string; paymentReceiptUrl?: string }) =>
      adminService.markWithdrawalPaid(id, paymentReceiptUrl),
    onSuccess: () => {
      toast.success("Withdrawal marked as paid");
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      setPaidTarget(null);
    },
    onError: () => toast.error("Failed to mark as paid"),
  });

  const markFailedMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.markWithdrawalFailed(id, reason),
    onSuccess: () => {
      toast.success("Withdrawal marked as failed");
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      setFailTarget(null);
    },
    onError: () => toast.error("Failed to mark as failed"),
  });

  async function handleExport() {
    setExporting(true);
    try {
      const res = await adminService.exportPayouts();
      const { csv, filename } = res.data.data;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  }

  return (
    <AdminLayout
      searchPlaceholder="Search hosts or transactions..."
      searchValue={search}
      onSearch={(v) => {
        setSearch(v);
        setHistoryPage(1);
        setPendingPage(1);
      }}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* ── Page header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight">Payouts &amp; Withdrawals</h1>
              <p className="text-on-surface-variant text-sm mt-1 max-w-lg">
                Manage and audit financial distributions to experience hosts.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-headline font-bold text-sm shadow-md hover:opacity-90 transition-opacity shrink-0 disabled:opacity-60"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </button>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Paid Out */}
            <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm min-w-0 group">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ background: "rgba(0,82,52,0.12)" }} />
              <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ background: "rgba(0,82,52,0.07)" }} />
              <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
                <Wallet className="h-4 w-4 text-primary/60" /> Total Paid Out
              </p>
              <p className="font-headline font-extrabold text-2xl text-primary tracking-tight">
                {isLoading ? "–" : fmtETB(paidTotal)} <span className="text-base font-semibold text-primary/60">ETB</span>
              </p>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">All-time lifetime distribution</p>
            </div>

            {/* Pending Transfers */}
            <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm min-w-0 group border-b-4 border-amber-300/60">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ background: "rgba(255,179,71,0.22)" }} />
              <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ background: "rgba(255,179,71,0.14)" }} />
              <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
                <Clock className="h-4 w-4 text-on-tertiary-container" /> Pending Transfers
              </p>
              <div className="flex items-baseline gap-2">
                <p className="font-headline font-extrabold text-2xl text-primary tracking-tight">
                  {isLoading ? "–" : pendingCount}
                </p>
                <span className="text-xs text-on-surface-variant font-medium">
                  / {isLoading ? "–" : fmtETB(pendingAmount)} ETB
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">Awaiting administrative approval</p>
            </div>

            {/* Failed Payouts */}
            <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm min-w-0 group">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ background: "rgba(186,26,26,0.12)" }} />
              <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ background: "rgba(186,26,26,0.07)" }} />
              <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
                <AlertCircle className="h-4 w-4 text-error" /> Failed Payouts
              </p>
              <p className="font-headline font-extrabold text-2xl text-error tracking-tight">
                {isLoading ? "–" : failedCount}
              </p>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">Requires manual intervention</p>
            </div>
          </div>

          {/* ── Transaction history (completed payouts) ── */}
          <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm min-w-0">
            <div className="px-6 py-4 bg-surface-container-low/50 border-b border-outline-variant/10">
              <h3 className="font-headline font-extrabold text-base text-primary flex items-center gap-2">
                <History className="h-4 w-4 text-on-surface-variant" /> Transaction history
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Paid and failed withdrawals — each payout is a separate row and stays here when the host requests again.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-2 py-12 text-red-500">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm">Failed to load withdrawals.</p>
              </div>
            ) : (
              <>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full min-w-[880px] text-left">
                    <thead className="bg-surface-container-low/30">
                      <tr>
                        {["Host", "Amount (ETB)", "Status", "Processed", "Bank / account", "Receipt"].map((h) => (
                          <th key={h} className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/8">
                      {historyPaginated.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-sm text-on-surface-variant">
                            No completed withdrawals yet.
                          </td>
                        </tr>
                      ) : historyPaginated.map((wr) => {
                        const st = (wr.status ?? "pending_transfer") as PayoutStatus;
                        const bank = bankDetailsForPayout(wr);
                        const when = wr.processedAt ?? wr.createdAt;
                        return (
                          <tr key={wr._id} className="hover:bg-surface-container/30 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {wr.host?.photo ? (
                                  <img src={wr.host.photo} alt={wr.host.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-headline font-bold text-xs text-on-secondary-container shrink-0">
                                    {initials(wr.host?.name ?? "?")}
                                  </div>
                                )}
                                <div>
                                  <p className="font-headline font-semibold text-sm text-primary">{wr.host?.name ?? "–"}</p>
                                  <p className="text-[10px] text-on-surface-variant">{wr.host?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="font-headline font-bold text-sm text-primary">{fmtETB(wr.amountCents ?? 0)}</span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS[st].pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS[st].dot}`} />
                                {STATUS[st].label}
                              </span>
                              {wr.failureReason && (
                                <p className="text-[10px] text-red-500 mt-0.5 max-w-[180px] truncate" title={wr.failureReason}>{wr.failureReason}</p>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                              {when ? new Date(when).toLocaleString() : "—"}
                            </td>
                            <td className="px-5 py-4 align-top max-w-[220px]">
                              <p className="text-xs font-semibold text-primary leading-tight">{bank.bank}</p>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">{bank.accountName}</p>
                              <p className="text-[10px] font-mono text-on-surface mt-0.5 break-all">{bank.accountNumber}</p>
                            </td>
                            <td className="px-5 py-4 align-top max-w-[140px]">
                              {wr.paymentReceiptUrl ? (
                                <a
                                  href={wr.paymentReceiptUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline break-all"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" /> View
                                </a>
                              ) : (
                                <span className="text-[10px] text-outline-variant">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 bg-surface-container-low/20 border-t border-outline-variant/10 flex items-center justify-between">
                  <p className="text-xs text-on-surface-variant">
                    Showing{" "}
                    <span className="font-bold text-primary">
                      {historyRows.length === 0 ? 0 : Math.min((historyPage - 1) * PAGE_SIZE + 1, historyRows.length)}
                      –
                      {Math.min(historyPage * PAGE_SIZE, historyRows.length)}
                    </span>{" "}
                    of <span className="font-bold text-primary">{historyRows.length}</span> completed
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setHistoryPage(n)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          historyPage === n ? "bg-primary text-white" : "text-primary hover:bg-surface-container"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                      disabled={historyPage === historyTotalPages}
                      className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Withdrawal requests (pending only) ── */}
          <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm min-w-0">
            <div className="px-6 py-4 bg-surface-container-low/50 border-b border-outline-variant/10">
              <h3 className="font-headline font-extrabold text-base text-primary">Withdrawal requests</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Pending transfers awaiting mark paid or failed. New requests appear here without replacing past history.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-2 py-12 text-red-500">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm">Failed to load withdrawals.</p>
              </div>
            ) : (
              <>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left">
                    <thead className="bg-surface-container-low/30">
                      <tr>
                        {["Host", "Amount (ETB)", "Status", "Requested", "Bank / account", "Receipt", "Actions"].map((h, i) => (
                          <th
                            key={h}
                            className={`px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ${i === 6 ? "text-right" : ""}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/8">
                      {pendingPaginated.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-sm text-on-surface-variant">
                            No pending withdrawal requests.
                          </td>
                        </tr>
                      ) : pendingPaginated.map((wr) => {
                        const st = (wr.status ?? "pending_transfer") as PayoutStatus;
                        const isPaying =
                          markPaidMutation.isPending &&
                          markPaidMutation.variables?.id === wr._id;
                        const bank = bankDetailsForPayout(wr);
                        return (
                          <tr key={wr._id} className="hover:bg-surface-container/30 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {wr.host?.photo ? (
                                  <img src={wr.host.photo} alt={wr.host.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-headline font-bold text-xs text-on-secondary-container shrink-0">
                                    {initials(wr.host?.name ?? "?")}
                                  </div>
                                )}
                                <div>
                                  <p className="font-headline font-semibold text-sm text-primary">{wr.host?.name ?? "–"}</p>
                                  <p className="text-[10px] text-on-surface-variant">{wr.host?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="font-headline font-bold text-sm text-primary">{fmtETB(wr.amountCents ?? 0)}</span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS[st].pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS[st].dot}`} />
                                {STATUS[st].label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                              {new Date(wr.createdAt).toLocaleString()}
                            </td>
                            <td className="px-5 py-4 align-top max-w-[220px]">
                              <p className="text-xs font-semibold text-primary leading-tight">{bank.bank}</p>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">{bank.accountName}</p>
                              <p className="text-[10px] font-mono text-on-surface mt-0.5 break-all">{bank.accountNumber}</p>
                            </td>
                            <td className="px-5 py-4 align-top max-w-[140px]">
                              <span className="text-[10px] text-outline-variant">—</span>
                            </td>
                            <td className="px-5 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setPaidTarget(wr)}
                                  disabled={isPaying || markPaidMutation.isPending}
                                  className="bg-primary text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                                >
                                  {isPaying && <Loader2 className="h-3 w-3 animate-spin" />}
                                  Mark Paid
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFailTarget(wr)}
                                  disabled={markPaidMutation.isPending}
                                  className="border border-error/25 text-error px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-error/5 transition-colors disabled:opacity-60"
                                >
                                  Mark Failed
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 bg-surface-container-low/20 border-t border-outline-variant/10 flex items-center justify-between">
                  <p className="text-xs text-on-surface-variant">
                    Showing{" "}
                    <span className="font-bold text-primary">
                      {pendingRows.length === 0 ? 0 : Math.min((pendingPage - 1) * PAGE_SIZE + 1, pendingRows.length)}
                      –
                      {Math.min(pendingPage * PAGE_SIZE, pendingRows.length)}
                    </span>{" "}
                    of <span className="font-bold text-primary">{pendingRows.length}</span> pending
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                      disabled={pendingPage === 1}
                      className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: pendingTotalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPendingPage(n)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          pendingPage === n ? "bg-primary text-white" : "text-primary hover:bg-surface-container"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPendingPage((p) => Math.min(pendingTotalPages, p + 1))}
                      disabled={pendingPage === pendingTotalPages}
                      className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Footer cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
            <div className="bg-surface-container-low/60 p-5 rounded-2xl border border-outline-variant/10">
              <h4 className="font-headline font-bold text-sm text-primary flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-4 w-4 text-on-tertiary-container" /> Admin Tip
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Payouts marked as "Paid" are final and deduct from the host's pending balance. "Failed" payouts return the amount to the host's available balance automatically. Always verify bank details before marking paid.
              </p>
            </div>
            <div className="bg-primary-container p-5 rounded-2xl flex items-center justify-between gap-4 shadow-md">
              <div>
                <h4 className="font-headline font-bold text-sm text-white">Need assistance?</h4>
                <p className="text-xs text-white/75 mt-0.5">Contact the financial operations team for complex bank reconciliation.</p>
              </div>
              <button className="shrink-0 bg-tertiary-fixed text-on-tertiary-fixed px-4 py-2 rounded-xl font-headline font-bold text-xs hover:opacity-90 transition-opacity whitespace-nowrap">
                Support Portal
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Mark-Failed modal ── */}
      {failTarget && (
        <FailModal
          wr={failTarget}
          loading={markFailedMutation.isPending}
          onClose={() => setFailTarget(null)}
          onConfirm={(id, reason) => markFailedMutation.mutate({ id, reason })}
        />
      )}

      {paidTarget && (
        <MarkPaidModal
          wr={paidTarget}
          loading={markPaidMutation.isPending}
          onClose={() => setPaidTarget(null)}
          onConfirm={(id, paymentReceiptUrl) =>
            markPaidMutation.mutate({ id, paymentReceiptUrl })
          }
        />
      )}
    </AdminLayout>
  );
}
