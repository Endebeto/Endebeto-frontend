import { useState } from "react";
import {
  Banknote, Wallet, ArrowDownToLine, FileText,
  Building2, ShieldCheck, Filter, Download,
  ChevronLeft, ChevronRight, X, AlertCircle,
  TrendingUp, Ticket, Info,
} from "lucide-react";
import HostLayout from "@/components/HostLayout";

/* ─── types ──────────────────────────────────────────── */
type TxType   = "booking" | "withdrawal";
type TxStatus = "paid" | "pending" | "failed";

interface Transaction {
  id: string;
  date: string;
  txId: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  description?: string;
}

/* ─── mock data ──────────────────────────────────────── */
const TRANSACTIONS: Transaction[] = [
  { id: "1", date: "Oct 24, 2023", txId: "#TRX-99812", type: "booking",    amount:  12400, status: "paid",    description: "Highland Coffee Ceremony — 4 guests" },
  { id: "2", date: "Oct 22, 2023", txId: "#TRX-99750", type: "withdrawal", amount: -45000, status: "pending", description: "Withdrawal to CBE ****8902" },
  { id: "3", date: "Oct 19, 2023", txId: "#TRX-99644", type: "booking",    amount:   8250, status: "paid",    description: "Simien Peaks Trek — 2 guests" },
  { id: "4", date: "Oct 15, 2023", txId: "#TRX-99521", type: "withdrawal", amount: -15000, status: "paid",    description: "Withdrawal to CBE ****8902" },
  { id: "5", date: "Oct 12, 2023", txId: "#TRX-99410", type: "withdrawal", amount:  -5000, status: "failed",  description: "Withdrawal to CBE ****8902" },
  { id: "6", date: "Oct 08, 2023", txId: "#TRX-99301", type: "booking",    amount:   3100, status: "paid",    description: "Gourmet Injera Workshop — 5 guests" },
  { id: "7", date: "Oct 05, 2023", txId: "#TRX-99188", type: "booking",    amount:   6800, status: "paid",    description: "Highland Coffee Ceremony — 6 guests" },
];

const PAGE_SIZE = 5;

/* ─── status / type styles ───────────────────────────── */
const statusStyle: Record<TxStatus, string> = {
  paid:    "bg-secondary-container text-on-secondary-fixed-variant dark:bg-emerald-900/40 dark:text-emerald-300",
  pending: "bg-[#ffddb8]/60 text-[#653e00] dark:bg-amber-900/40 dark:text-amber-300",
  failed:  "bg-error-container text-on-error-container dark:bg-red-900/40 dark:text-red-300",
};

/* ─── withdraw modal ─────────────────────────────────── */
function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    amountETB: "", bankName: "", accountName: "", accountNumber: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const amount = parseFloat(form.amountETB) || 0;
  const tooLow  = amount > 0 && amount < 10;
  const tooHigh = amount > 100000;
  const valid   =
    amount >= 10 && amount <= 100000 &&
    form.bankName.trim() && form.accountName.trim() && form.accountNumber.trim();

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 w-full max-w-md">

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary-container/50 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-7 w-7 text-primary dark:text-green-400" />
            </div>
            <h3 className="font-headline font-extrabold text-lg text-primary dark:text-green-400 mb-2">Withdrawal Submitted</h3>
            <p className="text-sm text-on-surface-variant dark:text-zinc-400 leading-relaxed mb-6">
              Your withdrawal of <strong className="text-on-surface dark:text-white">ETB {Number(form.amountETB).toLocaleString()}</strong> has been submitted. Funds are typically processed within 3–5 business days.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10 dark:border-zinc-700">
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

            <div className="p-6 space-y-4">
              {/* amount */}
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                  Amount (ETB) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant dark:text-zinc-400">ETB</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amountETB}
                    onChange={(e) => setForm((p) => ({ ...p, amountETB: e.target.value }))}
                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-on-surface dark:text-white text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                {tooLow  && <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Minimum withdrawal is ETB 10</p>}
                {tooHigh && <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Maximum withdrawal is ETB 100,000</p>}
                {!tooLow && !tooHigh && (
                  <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 mt-1">Min: ETB 10 · Max: ETB 100,000</p>
                )}
              </div>

              {/* bank name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                  Bank Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  value={form.bankName}
                  onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-on-surface dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* account name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                  Account Holder Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full name on bank account"
                  value={form.accountName}
                  onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-on-surface dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* account number */}
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                  Account Number <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your account number"
                  value={form.accountNumber}
                  onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-on-surface dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                />
              </div>

              {/* info note */}
              <div className="flex items-start gap-2.5 p-3 bg-surface-container-low dark:bg-zinc-800 rounded-xl">
                <Info className="h-4 w-4 text-on-surface-variant dark:text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                  Withdrawals are processed within 3–5 business days. You keep 85% of each booking; Endebeto's 15% platform fee is already deducted from your available balance.
                </p>
              </div>
            </div>

            {/* footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 text-on-surface dark:text-white text-sm font-medium hover:bg-surface dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!valid || submitting}
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
                ) : (
                  <>
                    <ArrowDownToLine className="h-4 w-4" />
                    Withdraw {amount >= 10 ? `ETB ${amount.toLocaleString()}` : "Funds"}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────── */
export default function HostWallet() {
  const [search, setSearch] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = TRANSACTIONS.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.txId.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <HostLayout
      hostName="Selamawit T."
      hostInitials="ST"
      hostTitle="Superhost"
      searchValue={search}
      onSearch={(v) => { setSearch(v); setPage(1); }}
    >
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}

      <main className="p-10 max-w-[1440px]">

        {/* ── Page Header ──────────────────────────────── */}
        <header className="mb-10">
          <h1 className="text-3xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight">Host Wallet</h1>
          <p className="text-on-surface-variant dark:text-zinc-400 mt-1">Manage your earnings, payouts, and financial history.</p>
        </header>

        {/* ── Balance cards ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

          {/* Available Balance */}
          <div className="lg:col-span-2 relative overflow-hidden bg-primary-container dark:bg-[#064e3b] p-8 rounded-2xl text-white shadow-lg flex flex-col justify-between min-h-[220px]">
            {/* decorative blobs */}
            <div className="absolute right-[-10%] bottom-[-20%] w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(0,53,39,0.4)" }} />
            <div className="absolute right-[5%] top-[-10%]  w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(76,99,89,0.2)" }} />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 opacity-70" />
                <span className="text-white/70 font-semibold text-xs uppercase tracking-widest">Available Balance</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-headline font-black tracking-tighter">142,500.00</span>
                <span className="text-xl font-bold opacity-60">ETB</span>
              </div>
              <p className="text-white/60 text-xs mt-2 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                +12% compared to last month
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={() => setShowWithdraw(true)}
                className="px-7 py-3 bg-[#ffddb8] text-[#2a1700] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 text-sm shadow-md"
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

          {/* Pending Payout */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-outline-variant/15 dark:border-zinc-700 border-l-4 border-l-[#ffddb8] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="h-4 w-4 text-on-surface-variant dark:text-zinc-400" />
                <span className="text-on-surface-variant dark:text-zinc-400 font-semibold text-xs uppercase tracking-widest">Pending Payout</span>
              </div>
              <div className="flex items-baseline gap-2 text-primary dark:text-green-400 mt-1">
                <span className="text-4xl font-headline font-black tracking-tighter">28,450.00</span>
                <span className="text-lg font-bold opacity-60">ETB</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-[#ffddb8]/15 dark:bg-amber-900/20 rounded-xl border border-[#ffddb8]/40 dark:border-amber-800/30">
              <p className="text-xs text-[#653e00] dark:text-amber-300 leading-relaxed">
                <strong>Next Payout:</strong> Funds from recent bookings will be available in 3–5 business days.
              </p>
            </div>
          </div>
        </div>

        {/* ── Two-column: Bank Info + History ──────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">

          {/* Bank Details + Tip */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-outline-variant/10 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline font-bold text-primary dark:text-green-400">Bank Details</h3>
                <button className="text-primary dark:text-green-400 text-xs font-bold hover:underline">Edit</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-surface-container dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 font-medium uppercase tracking-wide">Bank Name</p>
                    <p className="text-sm font-bold text-primary dark:text-green-400 leading-tight">Commercial Bank of Ethiopia</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 font-medium uppercase tracking-wide mb-0.5">Account Holder</p>
                  <p className="text-sm font-bold text-on-surface dark:text-white">Abebe Kebede</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 font-medium uppercase tracking-wide mb-0.5">Account Number</p>
                  <p className="text-sm font-mono font-bold text-on-surface dark:text-white tracking-wider">**** **** 8902</p>
                </div>
                <div className="pt-4 border-t border-outline-variant/15 dark:border-zinc-700 flex items-center gap-2 text-[11px] text-on-surface-variant dark:text-zinc-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Primary payout method verified
                </div>
              </div>
            </div>

            {/* Payout Tip */}
            <div className="bg-secondary-container/30 dark:bg-emerald-900/20 p-6 rounded-2xl border border-secondary-container/40 dark:border-emerald-800/30">
              <h4 className="font-headline font-bold text-sm text-on-secondary-container dark:text-emerald-300 mb-2">Payout Tip</h4>
              <p className="text-xs text-on-secondary-container/80 dark:text-zinc-400 leading-relaxed">
                Withdrawals initiated before <strong>Thursday 5:00 PM</strong> are processed same-week.
              </p>
            </div>
          </div>

          {/* Transaction History table */}
          <div className="xl:col-span-3">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-outline-variant/10 dark:border-zinc-700 overflow-hidden">

              {/* table header */}
              <div className="px-8 py-5 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-outline-variant/10 dark:border-zinc-700">
                <h3 className="font-headline font-bold text-primary dark:text-green-400">Transaction History</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-outline-variant/30 dark:border-zinc-600 hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors text-on-surface-variant dark:text-zinc-400">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg border border-outline-variant/30 dark:border-zinc-600 hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors text-on-surface-variant dark:text-zinc-400">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-8 py-4">Date</th>
                      <th className="px-4 py-4">Transaction ID</th>
                      <th className="px-4 py-4">Type</th>
                      <th className="px-4 py-4">Description</th>
                      <th className="px-4 py-4">Amount</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 dark:divide-zinc-800">
                    {paginated.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-container-low/30 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-8 py-5 text-sm font-medium text-on-surface-variant dark:text-zinc-400 whitespace-nowrap">
                          {t.date}
                        </td>
                        <td className="px-4 py-5 text-sm font-mono text-outline dark:text-zinc-500 whitespace-nowrap">
                          {t.txId}
                        </td>
                        <td className="px-4 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {t.type === "booking" ? (
                              <>
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                  <Ticket className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-sm font-semibold text-on-surface dark:text-white">Booking</span>
                              </>
                            ) : (
                              <>
                                <div className="w-7 h-7 rounded-lg bg-[#ffddb8]/40 dark:bg-amber-900/30 flex items-center justify-center">
                                  <Wallet className="h-3.5 w-3.5 text-[#653e00] dark:text-amber-400" />
                                </div>
                                <span className="text-sm font-semibold text-on-surface dark:text-white">Withdrawal</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-5 text-xs text-on-surface-variant dark:text-zinc-400 max-w-[200px] truncate">
                          {t.description}
                        </td>
                        <td className={`px-4 py-5 text-sm font-bold whitespace-nowrap ${t.amount > 0 ? "text-primary dark:text-green-400" : "text-error dark:text-red-400"}`}>
                          {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()} ETB
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle[t.status]}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-sm text-on-surface-variant dark:text-zinc-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* pagination footer */}
              <div className="px-8 py-5 bg-white dark:bg-zinc-900 border-t border-outline-variant/10 dark:border-zinc-700 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant dark:text-zinc-400">
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-primary dark:text-green-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        p === page
                          ? "bg-primary text-white dark:bg-green-600"
                          : "text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-primary dark:text-green-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </HostLayout>
  );
}
