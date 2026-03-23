import { useState } from "react";
import {
  Download, Wallet, Clock, AlertCircle, Filter,
  ChevronLeft, ChevronRight, History, Lightbulb, X,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

/* ─── types ──────────────────────────────────────────────── */
type PayoutStatus = "pending" | "paid" | "failed";

interface Payout {
  id: string;
  hostName: string;
  hostExperience: string;
  initials: string;
  amount: string;
  status: PayoutStatus;
  date: string;
  bank: string;
  account: string;
  failureReason?: string;
}

/* ─── mock data ──────────────────────────────────────────── */
const initialPayouts: Payout[] = [
  { id: "1", hostName: "Selamawit Tadesse", hostExperience: "Lalibela Coffee Tours",     initials: "ST", amount: "12,450.00", status: "pending", date: "Oct 24, 2023", bank: "Commercial Bank of Ethiopia", account: "****8901" },
  { id: "2", hostName: "Abebe Bikila",      hostExperience: "Simien Mountains Guide",    initials: "AB", amount: "8,200.00",  status: "paid",    date: "Oct 22, 2023", bank: "Dashen Bank",                  account: "****4412" },
  { id: "3", hostName: "Yonas Kassa",       hostExperience: "Omo Valley Immersion",      initials: "YK", amount: "21,000.00", status: "failed",  date: "Oct 20, 2023", bank: "Awash International Bank",      account: "****5566", failureReason: "Invalid Account Number" },
  { id: "4", hostName: "Tigist Haile",      hostExperience: "Gondar Cultural Walk",      initials: "TH", amount: "5,800.00",  status: "pending", date: "Oct 19, 2023", bank: "Bank of Abyssinia",             account: "****2233" },
  { id: "5", hostName: "Bereket Mesfin",    hostExperience: "Danakil Depression Trek",   initials: "BM", amount: "34,500.00", status: "paid",    date: "Oct 18, 2023", bank: "Commercial Bank of Ethiopia",  account: "****7700" },
  { id: "6", hostName: "Hiwot Girma",       hostExperience: "Blue Nile Falls Experience",initials: "HG", amount: "9,150.00",  status: "failed",  date: "Oct 17, 2023", bank: "Dashen Bank",                  account: "****3381", failureReason: "Bank Rejection" },
];

/* ─── status styles ──────────────────────────────────────── */
const STATUS: Record<PayoutStatus, { pill: string; dot: string; label: string }> = {
  pending: { pill: "bg-tertiary-fixed text-on-tertiary-fixed",              dot: "bg-on-tertiary-container", label: "Pending"  },
  paid:    { pill: "bg-secondary-container text-on-secondary-container",    dot: "bg-on-primary-container",  label: "Paid"     },
  failed:  { pill: "bg-error-container text-on-error-container",            dot: "bg-error",                 label: "Failed"   },
};

const PAGE_SIZE = 5;

/* ─── Mark-Failed Modal ──────────────────────────────────── */
function FailModal({ payout, onClose, onConfirm }: {
  payout: Payout;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("Invalid Account Number");
  const [note, setNote]     = useState("");
  return (
    <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#2d3133] w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-headline font-extrabold text-lg text-primary">Mark Payout as Failed</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-on-surface-variant mb-6">
          Specify the reason for failure for <strong>{payout.hostName}</strong>. This will be visible to the host.
        </p>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">Reason Code</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface font-headline font-bold text-sm hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(payout.id, `${reason}${note ? ": " + note : ""}`)}
            className="flex-1 py-2.5 rounded-xl bg-error text-white font-headline font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
          >
            Confirm Failure
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────── */
export default function AdminPayouts() {
  const [search, setSearch]         = useState("");
  const [payouts, setPayouts]       = useState<Payout[]>(initialPayouts);
  const [failTarget, setFailTarget] = useState<Payout | null>(null);
  const [page, setPage]             = useState(1);

  /* derived */
  const filtered = payouts.filter(
    (p) =>
      p.hostName.toLowerCase().includes(search.toLowerCase()) ||
      p.hostExperience.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount  = payouts.filter((p) => p.status === "pending").length;
  const pendingAmount = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + parseFloat(p.amount.replace(",", "")), 0);
  const failedCount   = payouts.filter((p) => p.status === "failed").length;

  /* actions */
  function markPaid(id: string) {
    setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, status: "paid" } : p));
  }
  function confirmFailed(id: string, reason: string) {
    setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, status: "failed", failureReason: reason } : p));
    setFailTarget(null);
  }
  function retryPayout(id: string) {
    setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, status: "pending", failureReason: undefined } : p));
  }

  return (
    <AdminLayout
      searchPlaceholder="Search hosts or transactions..."
      searchValue={search}
      onSearch={(v) => { setSearch(v); setPage(1); }}
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
            <button className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-headline font-bold text-sm shadow-md hover:opacity-90 transition-opacity shrink-0">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Paid Out */}
            <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ background: "rgba(0,82,52,0.12)" }} />
              <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ background: "rgba(0,82,52,0.07)" }} />
              <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
                <Wallet className="h-4 w-4 text-primary/60" /> Total Paid Out
              </p>
              <p className="font-headline font-extrabold text-2xl text-primary tracking-tight">
                850,000.00 <span className="text-base font-semibold text-primary/60">ETB</span>
              </p>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">All-time lifetime distribution</p>
            </div>

            {/* Pending Transfers */}
            <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm overflow-hidden group border-b-4 border-amber-300/60">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ background: "rgba(255,179,71,0.22)" }} />
              <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ background: "rgba(255,179,71,0.14)" }} />
              <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
                <Clock className="h-4 w-4 text-on-tertiary-container" /> Pending Transfers
              </p>
              <div className="flex items-baseline gap-2">
                <p className="font-headline font-extrabold text-2xl text-primary tracking-tight">{pendingCount}</p>
                <span className="text-xs text-on-surface-variant font-medium">
                  / {pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">Awaiting administrative approval</p>
            </div>

            {/* Failed Payouts */}
            <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ background: "rgba(186,26,26,0.12)" }} />
              <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ background: "rgba(186,26,26,0.07)" }} />
              <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
                <AlertCircle className="h-4 w-4 text-error" /> Failed Payouts
              </p>
              <p className="font-headline font-extrabold text-2xl text-error tracking-tight">{failedCount}</p>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">Requires manual intervention</p>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm overflow-hidden">
            {/* Table header bar */}
            <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/50 border-b border-outline-variant/10">
              <h3 className="font-headline font-extrabold text-base text-primary">Recent Requests</h3>
              <button className="flex items-center gap-1.5 bg-white dark:bg-surface-container border border-outline-variant/20 px-3 py-1.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                <Filter className="h-3 w-3" /> Filter
              </button>
            </div>

            {/* Scrollable table */}
            <div className="scrollbar-hide" style={{ overflowX: "auto", scrollbarWidth: "none" }}>
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-surface-container-low/30">
                  <tr>
                    {["Host", "Amount (ETB)", "Status", "Requested Date", "Bank Details", "Actions"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ${i === 5 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/8">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-on-surface-variant">
                        No payout records found.
                      </td>
                    </tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container/30 transition-colors">
                      {/* Host */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-headline font-bold text-xs text-on-secondary-container shrink-0">
                            {p.initials}
                          </div>
                          <div>
                            <p className="font-headline font-semibold text-sm text-primary">{p.hostName}</p>
                            <p className="text-[10px] text-on-surface-variant">{p.hostExperience}</p>
                          </div>
                        </div>
                      </td>
                      {/* Amount */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-headline font-bold text-sm text-primary">{p.amount}</span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS[p.status].pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS[p.status].dot}`} />
                          {STATUS[p.status].label}
                        </span>
                        {p.failureReason && (
                          <p className="text-[10px] text-red-500 mt-0.5 max-w-[140px] truncate">{p.failureReason}</p>
                        )}
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">{p.date}</td>
                      {/* Bank */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-primary">{p.bank}</p>
                        <p className="text-[10px] text-on-surface-variant">Acc: {p.account}</p>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {p.status === "pending" && (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => markPaid(p.id)}
                              className="bg-primary text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold hover:opacity-90 transition-opacity shadow-sm"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => setFailTarget(p)}
                              className="border border-error/25 text-error px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-error/5 transition-colors"
                            >
                              Mark Failed
                            </button>
                          </div>
                        )}
                        {p.status === "paid" && (
                          <button className="flex items-center gap-1 text-primary text-[10px] font-bold px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-colors ml-auto">
                            <History className="h-3.5 w-3.5" /> View History
                          </button>
                        )}
                        {p.status === "failed" && (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => retryPayout(p.id)}
                              className="bg-primary text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold hover:opacity-90 transition-opacity shadow-sm"
                            >
                              Retry Payout
                            </button>
                            <button className="bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-surface-container-high transition-colors">
                              Edit Details
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 bg-surface-container-low/20 border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                Showing <span className="font-bold text-primary">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-primary">{filtered.length}</span> payout requests
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      page === n ? "bg-primary text-white" : "text-primary hover:bg-surface-container"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Footer cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
            {/* Admin tip */}
            <div className="bg-surface-container-low/60 p-5 rounded-2xl border border-outline-variant/10">
              <h4 className="font-headline font-bold text-sm text-primary flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-4 w-4 text-on-tertiary-container" /> Admin Tip
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Payouts marked as "Paid" are final. For failed transactions, ensure the host has updated their bank details before retrying the transfer. Automated exports are available in the settings panel.
              </p>
            </div>
            {/* Support CTA */}
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
          payout={failTarget}
          onClose={() => setFailTarget(null)}
          onConfirm={confirmFailed}
        />
      )}
    </AdminLayout>
  );
}
