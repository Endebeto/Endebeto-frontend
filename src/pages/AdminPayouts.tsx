import { Download, Loader2 } from "lucide-react";
import { FailModal } from "@/components/admin-payouts/FailModal";
import { MarkPaidModal } from "@/components/admin-payouts/MarkPaidModal";
import { PayoutFooterCards } from "@/components/admin-payouts/PayoutFooterCards";
import { PayoutHistoryPanel } from "@/components/admin-payouts/PayoutHistoryPanel";
import { PayoutPendingPanel } from "@/components/admin-payouts/PayoutPendingPanel";
import { PayoutSummaryCards } from "@/components/admin-payouts/PayoutSummaryCards";
import { useAdminPayouts } from "@/hooks/useAdminPayouts";
import { useSyncAdminHeader } from "@/hooks/useSyncAdminHeader";

export default function AdminPayouts() {
  const {
    search,
    onSearch,
    failTarget,
    setFailTarget,
    paidTarget,
    setPaidTarget,
    historyPage,
    setHistoryPage,
    pendingPage,
    setPendingPage,
    exporting,
    handleExport,
    revealedAccounts,
    revealingId,
    handleReveal,
    isLoading,
    isError,
    paidTotal,
    pendingCount,
    pendingAmount,
    failedCount,
    historyWithdrawals,
    historyTotal,
    historyTotalPages,
    pendingWithdrawals,
    pendingTotal,
    pendingTotalPages,
    markPaidMutation,
    markFailedMutation,
  } = useAdminPayouts();

  useSyncAdminHeader({
    searchPlaceholder: "Search hosts or transactions...",
    searchValue: search,
    onSearch,
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight">
                Payouts &amp; Withdrawals
              </h1>
              <p className="text-on-surface-variant text-sm mt-1 max-w-lg">
                Manage and audit financial distributions to experience hosts.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-headline font-bold text-sm shadow-md hover:opacity-90 transition-opacity shrink-0 disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export CSV
            </button>
          </div>

          <PayoutSummaryCards
            isLoading={isLoading}
            paidTotal={paidTotal}
            pendingCount={pendingCount}
            pendingAmount={pendingAmount}
            failedCount={failedCount}
          />

          <PayoutPendingPanel
            isLoading={isLoading}
            isError={isError}
            pendingWithdrawals={pendingWithdrawals}
            pendingTotal={pendingTotal}
            pendingPage={pendingPage}
            setPendingPage={setPendingPage}
            pendingTotalPages={pendingTotalPages}
            revealedAccounts={revealedAccounts}
            revealingId={revealingId}
            onReveal={handleReveal}
            onMarkPaid={setPaidTarget}
            onMarkFailed={setFailTarget}
            markPaidMutation={markPaidMutation}
          />

          <PayoutHistoryPanel
            isLoading={isLoading}
            isError={isError}
            historyWithdrawals={historyWithdrawals}
            historyTotal={historyTotal}
            historyPage={historyPage}
            setHistoryPage={setHistoryPage}
            historyTotalPages={historyTotalPages}
            revealedAccounts={revealedAccounts}
            revealingId={revealingId}
            onReveal={handleReveal}
          />

          <PayoutFooterCards />
        </div>
      </div>

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
          revealedFullAccount={revealedAccounts[paidTarget._id]}
          revealingAccount={revealingId === paidTarget._id}
          onRevealAccount={() => handleReveal(paidTarget._id)}
          onClose={() => setPaidTarget(null)}
          onConfirm={(id, paymentReceiptUrl) =>
            markPaidMutation.mutate({ id, paymentReceiptUrl })
          }
        />
      )}
    </>
  );
}
