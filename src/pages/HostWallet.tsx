import {
  Wallet,
  ArrowDownToLine,
  FileText,
  TrendingUp,
  Loader2,
  Clock,
  ArrowUpFromLine,
  TrendingDown,
  Search,
} from "lucide-react";
import HostLayout from "@/components/HostLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { WithdrawModal } from "@/components/host-wallet/WithdrawModal";
import { WalletEarningRow } from "@/components/host-wallet/WalletEarningRow";
import { WalletWithdrawalRow } from "@/components/host-wallet/WalletWithdrawalRow";
import { WithdrawalsPager } from "@/components/host-wallet/WithdrawalsPager";
import { etb } from "@/components/host-wallet/walletFormatters";
import { useHostWallet } from "@/hooks/useHostWallet";

export default function HostWallet() {
  const {
    user,
    refreshUser,
    walletActivityRef,
    wallet,
    walletLoading,
    earnings,
    earningsLoading,
    earningsPage,
    setEarningsPage,
    totalE,
    totalEPages,
    pendingWithdrawalsRows,
    pendingWithdrawalsTotal,
    pendingWithdrawalsPages,
    pendingWithdrawalsPage,
    setPendingWithdrawalsPage,
    historyWithdrawalsRows,
    historyWithdrawalsTotal,
    historyWithdrawalsPages,
    historyWithdrawalsPage,
    setHistoryWithdrawalsPage,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    withdrawModalKey,
    setWithdrawModalKey,
    showWithdraw,
    setShowWithdraw,
    availableETB,
    canWithdraw,
    cooldownActive,
    nextAvailableAt,
    hasPendingWithdrawal,
    totalWithdrawalsCount,
    withdrawalsLoading,
    legalHostName,
    invalidateAll,
    resetWithdrawalPaging,
    scrollToStatement,
  } = useHostWallet();

  return (
    <HostLayout hostName={user?.name ?? "Host"} hostTitle="Host">
      {showWithdraw && (
        <WithdrawModal
          key={withdrawModalKey}
          availableETB={availableETB}
          accountHolderLegalName={legalHostName}
          savedBankName={user?.hostPayoutBankName}
          savedAccountName={user?.hostPayoutAccountName}
          savedAccountNumber={user?.hostPayoutAccountNumber}
          onClose={() => setShowWithdraw(false)}
          onWithdrawComplete={async () => {
            await refreshUser();
            invalidateAll();
          }}
        />
      )}

      <main className="p-10 max-w-[1440px]">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <UserAvatar
            name={user?.name ?? "Host"}
            photo={user?.photo}
            className="h-14 w-14 rounded-full bg-primary text-white ring-2 ring-primary/20 dark:ring-green-400/30"
            initialsClassName="text-lg text-white"
            imgClassName="h-full w-full object-cover"
            alt={user?.name ?? "Host"}
          />
          <div className="min-w-0">
            <h1 className="text-3xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight">
              Host Wallet
            </h1>
            <p className="text-on-surface-variant dark:text-zinc-400 mt-1">
              Manage your earnings, payouts, and financial history.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-1 relative overflow-hidden bg-primary-container dark:bg-[#064e3b] p-8 rounded-2xl text-white shadow-lg flex flex-col justify-between min-h-[220px]">
            <div
              className="absolute right-[-10%] bottom-[-20%] w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ background: "rgba(0,53,39,0.4)" }}
            />
            <div
              className="absolute right-[5%] top-[-10%]  w-32 h-32 rounded-full blur-2xl pointer-events-none"
              style={{ background: "rgba(76,99,89,0.2)" }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 opacity-70" />
                <span className="text-white/70 font-semibold text-xs uppercase tracking-widest">
                  Available Balance
                </span>
              </div>
              {walletLoading ? (
                <div className="flex items-center gap-2 mt-3">
                  <Loader2 className="h-6 w-6 animate-spin text-white/60" />
                  <span className="text-white/60 text-sm">Loading…</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-headline font-black tracking-tighter">
                      {etb(wallet?.availableBalanceCents ?? 0)}
                    </span>
                    <span className="text-xl font-bold opacity-60">ETB</span>
                  </div>
                  <p className="text-white/60 text-xs mt-2 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Ready to withdraw — 15% platform fee already deducted
                  </p>
                  {(wallet?.totalEarnedCents ?? 0) > 0 && wallet ? (
                    <p className="text-white/40 text-[11px] mt-1">
                      Gross earned: ETB{" "}
                      {etb(wallet.totalEarnedCents + wallet.totalFeesCents)}{" "}
                      &nbsp;·&nbsp; Fee: ETB {etb(wallet.totalFeesCents)}
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => {
                  setWithdrawModalKey((k) => k + 1);
                  setShowWithdraw(true);
                }}
                disabled={!canWithdraw}
                className="px-7 py-3 bg-[#ffddb8] text-[#2a1700] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw Funds
              </button>
              <button
                type="button"
                onClick={scrollToStatement}
                className="px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors rounded-xl font-bold text-sm flex items-center gap-2"
              >
                <FileText className="h-4 w-4 opacity-70" />
                View Statement
              </button>
            </div>
            <div className="relative z-10 mt-3 space-y-1">
              {cooldownActive && nextAvailableAt && (
                <p className="flex items-center gap-1.5 text-[11px] text-amber-300/90">
                  <Clock className="h-3 w-3 shrink-0" />
                  Next payout available:{" "}
                  <span className="font-semibold">
                    {nextAvailableAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
              )}
              {hasPendingWithdrawal && !cooldownActive && (
                <p className="flex items-center gap-1.5 text-[11px] text-blue-300/90">
                  <Loader2 className="h-3 w-3 shrink-0" />A payout request is
                  already in progress
                </p>
              )}
              {!cooldownActive && !hasPendingWithdrawal && (
                <p className="text-white/50 text-[10px] max-w-md leading-snug">
                  You can start a new payout request at most{" "}
                  <span className="text-white/70 font-semibold">
                    once every 7 days
                  </span>
                  .
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-outline-variant/15 dark:border-zinc-700 border-l-4 border-l-amber-400 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span className="text-on-surface-variant dark:text-zinc-400 font-semibold text-xs uppercase tracking-widest">
                  Held Earnings
                </span>
              </div>
              {walletLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-amber-500 mt-2" />
              ) : (
                <div className="flex items-baseline gap-2 text-amber-600 dark:text-amber-400 mt-1">
                  <span className="text-3xl font-headline font-black tracking-tighter">
                    {etb(wallet?.heldEarningsCents ?? 0)}
                  </span>
                  <span className="text-base font-bold opacity-60">ETB</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 mt-4 leading-relaxed">
              Paid by guests — released to your available balance once the
              experience date passes.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-outline-variant/15 dark:border-zinc-700 border-l-4 border-l-blue-400 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpFromLine className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span className="text-on-surface-variant dark:text-zinc-400 font-semibold text-xs uppercase tracking-widest">
                  In Transit
                </span>
              </div>
              {walletLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-2" />
              ) : (
                <div className="flex items-baseline gap-2 text-blue-600 dark:text-blue-400 mt-1">
                  <span className="text-3xl font-headline font-black tracking-tighter">
                    {etb(wallet?.payoutInTransitCents ?? 0)}
                  </span>
                  <span className="text-base font-bold opacity-60">ETB</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 mt-4 leading-relaxed">
              Money for pending bank transfers — typically arrives in 3–5
              business days. Each request stays in your history.
            </p>
          </div>
        </div>

        <div
          ref={walletActivityRef}
          id="wallet-activity"
          className="scroll-mt-28 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-outline-variant/10 dark:border-zinc-700 overflow-hidden"
        >
          <div className="px-8 py-0 flex items-center justify-between border-b border-outline-variant/10 dark:border-zinc-700">
            <div className="flex">
              {(["earnings", "withdrawals"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
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
                      Earnings{" "}
                      {totalE > 0 && (
                        <span className="bg-primary/10 dark:bg-green-900/40 text-primary dark:text-green-400 rounded-full px-1.5 py-0.5 text-[9px]">
                          {totalE}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <ArrowUpFromLine className="h-3.5 w-3.5" />
                      Withdrawals{" "}
                      {totalWithdrawalsCount > 0 && (
                        <span className="bg-primary/10 dark:bg-green-900/40 text-primary dark:text-green-400 rounded-full px-1.5 py-0.5 text-[9px]">
                          {totalWithdrawalsCount}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "withdrawals" && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-on-surface-variant dark:text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    resetWithdrawalPaging();
                  }}
                  placeholder="Search withdrawals…"
                  className="pl-8 pr-3 py-1.5 bg-surface-container-low dark:bg-zinc-800 rounded-lg text-xs border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500 w-48"
                />
              </div>
            )}
          </div>

          {activeTab === "earnings" && (
            <>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left min-w-[640px]">
                  <thead>
                    <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-8 py-4">Date</th>
                      <th className="px-4 py-4 min-w-[200px]">Experience</th>
                      <th className="px-4 py-4">Gross</th>
                      <th className="px-4 py-4">Fee (15%)</th>
                      <th className="px-4 py-4">You Receive</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 dark:divide-zinc-800">
                    {earningsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-green-400 mx-auto" />
                        </td>
                      </tr>
                    ) : earnings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-8 py-12 text-center text-sm text-on-surface-variant dark:text-zinc-400"
                        >
                          No earnings yet — earnings appear here when guests
                          book your experiences.
                        </td>
                      </tr>
                    ) : (
                      earnings.map((row) => (
                        <WalletEarningRow key={row._id} row={row} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <WithdrawalsPager
                page={earningsPage}
                totalPages={totalEPages}
                total={totalE}
                onPageChange={setEarningsPage}
              />
            </>
          )}

          {activeTab === "withdrawals" && (
            <>
              <p className="px-8 py-3 text-[11px] text-on-surface-variant dark:text-zinc-500 border-b border-outline-variant/10 dark:border-zinc-700 leading-relaxed">
                Past and pending payouts are listed below.{" "}
                <span className="text-on-surface dark:text-zinc-400 font-medium">
                  You can start one new payout request every 7 days.
                </span>
              </p>

              {withdrawalsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-green-400" />
                </div>
              ) : (
                <>
                  <div className="px-8 py-3 bg-amber-50/70 dark:bg-amber-950/25 border-b border-outline-variant/10 dark:border-zinc-800">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-900 dark:text-amber-400">
                      Pending requests ({pendingWithdrawalsTotal})
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
                        {pendingWithdrawalsRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-8 py-8 text-center text-sm text-on-surface-variant dark:text-zinc-400"
                            >
                              {search
                                ? "No pending withdrawals match your search."
                                : "No pending withdrawals."}
                            </td>
                          </tr>
                        ) : (
                          pendingWithdrawalsRows.map((w) => (
                            <WalletWithdrawalRow key={w._id} w={w} />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <WithdrawalsPager
                    page={pendingWithdrawalsPage}
                    totalPages={pendingWithdrawalsPages}
                    total={pendingWithdrawalsTotal}
                    onPageChange={setPendingWithdrawalsPage}
                  />

                  <div className="px-8 py-3 bg-surface-container-low/60 dark:bg-zinc-800/40 border-t border-b border-outline-variant/10 dark:border-zinc-800">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary dark:text-green-400">
                      Withdrawal history ({historyWithdrawalsTotal})
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
                        {historyWithdrawalsRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-8 py-8 text-center text-sm text-on-surface-variant dark:text-zinc-400"
                            >
                              {search
                                ? "No past withdrawals match your search."
                                : "No completed withdrawals yet."}
                            </td>
                          </tr>
                        ) : (
                          historyWithdrawalsRows.map((w) => (
                            <WalletWithdrawalRow key={w._id} w={w} />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <WithdrawalsPager
                    page={historyWithdrawalsPage}
                    totalPages={historyWithdrawalsPages}
                    total={historyWithdrawalsTotal}
                    onPageChange={setHistoryWithdrawalsPage}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </HostLayout>
  );
}
