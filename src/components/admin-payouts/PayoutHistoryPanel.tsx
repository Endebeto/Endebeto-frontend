import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  Loader2,
} from "lucide-react";
import type { AdminWithdrawal } from "@/services/admin.service";
import {
  bankDetailsForPayout,
  fmtETB,
  PAGE_SIZE,
  type PayoutStatus,
  PAYOUT_STATUS_STYLES,
  payoutInitials,
  visiblePages,
} from "./payoutUtils";

export function PayoutHistoryPanel({
  isLoading,
  isError,
  historyWithdrawals,
  historyTotal,
  historyPage,
  setHistoryPage,
  historyTotalPages,
  revealedAccounts,
  revealingId,
  onReveal,
}: {
  isLoading: boolean;
  isError: boolean;
  historyWithdrawals: AdminWithdrawal[];
  historyTotal: number;
  historyPage: number;
  setHistoryPage: (n: number | ((p: number) => number)) => void;
  historyTotalPages: number;
  revealedAccounts: Record<string, string>;
  revealingId: string | null;
  onReveal: (wrId: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm min-w-0">
      <div className="px-6 py-4 bg-surface-container-low/50 border-b border-outline-variant/10">
        <h3 className="font-headline font-extrabold text-base text-primary flex items-center gap-2">
          <History className="h-4 w-4 text-on-surface-variant" /> Transaction
          history
        </h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Paid and failed withdrawals — each payout is a separate row and stays
          here when the host requests again.
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
                  {[
                    "Host",
                    "Amount (ETB)",
                    "Status",
                    "Processed",
                    "Bank / account",
                    "Receipt",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/8">
                {historyWithdrawals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-on-surface-variant"
                    >
                      No completed withdrawals yet.
                    </td>
                  </tr>
                ) : (
                  historyWithdrawals.map((wr) => {
                    const st = (wr.status ?? "pending_transfer") as PayoutStatus;
                    const bank = bankDetailsForPayout(wr);
                    const when = wr.processedAt ?? wr.createdAt;
                    return (
                      <tr
                        key={wr._id}
                        className="hover:bg-surface-container/30 transition-colors"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {wr.host?.photo ? (
                              <img
                                src={wr.host.photo}
                                alt={wr.host.name}
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-headline font-bold text-xs text-on-secondary-container shrink-0">
                                {payoutInitials(wr.host?.name ?? "?")}
                              </div>
                            )}
                            <div>
                              <p className="font-headline font-semibold text-sm text-primary">
                                {wr.host?.name ?? "–"}
                              </p>
                              <p className="text-[10px] text-on-surface-variant">
                                {wr.host?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-headline font-bold text-sm text-primary">
                            {fmtETB(wr.amountCents ?? 0)}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${PAYOUT_STATUS_STYLES[st].pill}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${PAYOUT_STATUS_STYLES[st].dot}`}
                            />
                            {PAYOUT_STATUS_STYLES[st].label}
                          </span>
                          {wr.failureReason && (
                            <p
                              className="text-[10px] text-red-500 mt-0.5 max-w-[180px] truncate"
                              title={wr.failureReason}
                            >
                              {wr.failureReason}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                          {when ? new Date(when).toLocaleString() : "—"}
                        </td>
                        <td className="px-5 py-4 align-top max-w-[220px]">
                          <p className="text-xs font-semibold text-primary leading-tight">
                            {bank.bank}
                          </p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            {bank.accountName}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <p className="text-[10px] font-mono text-on-surface break-all">
                              {revealedAccounts[wr._id] ?? bank.accountNumber}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                void onReveal(wr._id);
                              }}
                              disabled={revealingId === wr._id}
                              title={
                                revealedAccounts[wr._id]
                                  ? "Hide account number"
                                  : "Reveal full account number (audit logged)"
                              }
                              className="shrink-0 p-0.5 rounded text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
                            >
                              {revealingId === wr._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : revealedAccounts[wr._id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top max-w-[140px]">
                          {wr.paymentReceiptUrl ? (
                            <a
                              href={wr.paymentReceiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline break-all"
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />{" "}
                              View
                            </a>
                          ) : (
                            <span className="text-[10px] text-outline-variant">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-surface-container-low/20 border-t border-outline-variant/10 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Showing{" "}
              <span className="font-bold text-primary">
                {historyTotal === 0
                  ? 0
                  : Math.min(
                      (historyPage - 1) * PAGE_SIZE + 1,
                      historyTotal,
                    )}
                –{Math.min(historyPage * PAGE_SIZE, historyTotal)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-primary">{historyTotal}</span>{" "}
              completed
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
              {visiblePages(historyPage, historyTotalPages).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setHistoryPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    historyPage === n
                      ? "bg-primary text-white"
                      : "text-primary hover:bg-surface-container"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
                }
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
  );
}
