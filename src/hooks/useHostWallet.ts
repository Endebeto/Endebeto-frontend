import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { hostQueryKeys } from "@/lib/hostQueryKeys";
import {
  walletService,
  type WithdrawalRequest,
} from "@/services/wallet.service";
import { PAGE_SIZE } from "@/components/host-wallet/walletFormatters";

export type HostWalletTab = "earnings" | "withdrawals";

export function useHostWallet() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [withdrawModalKey, setWithdrawModalKey] = useState(0);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [activeTab, setActiveTab] = useState<HostWalletTab>("earnings");
  const [earningsPage, setEarningsPage] = useState(1);
  const [pendingWithdrawalsPage, setPendingWithdrawalsPage] = useState(1);
  const [historyWithdrawalsPage, setHistoryWithdrawalsPage] = useState(1);

  const withdrawalsSearch = search.trim();

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: hostQueryKeys.wallet.summary(),
    queryFn: () => walletService.getWallet(),
    staleTime: 30_000,
  });

  const { data: pendingWData, isLoading: pendingWLoading } = useQuery({
    queryKey: hostQueryKeys.wallet.withdrawals(
      "pending",
      pendingWithdrawalsPage,
      withdrawalsSearch,
    ),
    queryFn: () =>
      walletService.getWithdrawals({
        tab: "pending",
        page: pendingWithdrawalsPage,
        limit: PAGE_SIZE,
        ...(withdrawalsSearch ? { q: withdrawalsSearch } : {}),
      }),
    staleTime: 30_000,
  });

  const { data: historyWData, isLoading: historyWLoading } = useQuery({
    queryKey: hostQueryKeys.wallet.withdrawals(
      "history",
      historyWithdrawalsPage,
      withdrawalsSearch,
    ),
    queryFn: () =>
      walletService.getWithdrawals({
        tab: "history",
        page: historyWithdrawalsPage,
        limit: PAGE_SIZE,
        ...(withdrawalsSearch ? { q: withdrawalsSearch } : {}),
      }),
    staleTime: 30_000,
  });

  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: hostQueryKeys.wallet.earnings(earningsPage),
    queryFn: () =>
      walletService.getEarnings({ page: earningsPage, limit: PAGE_SIZE }),
    staleTime: 30_000,
  });

  const wallet = walletData?.data?.data?.wallet;

  const pendingWithdrawalsRows: WithdrawalRequest[] =
    pendingWData?.data?.data?.withdrawals ?? [];
  const pendingWithdrawalsTotal = pendingWData?.data?.total ?? 0;
  const pendingWithdrawalsPages = pendingWData?.data?.pages ?? 1;

  const historyWithdrawalsRows: WithdrawalRequest[] =
    historyWData?.data?.data?.withdrawals ?? [];
  const historyWithdrawalsTotal = historyWData?.data?.total ?? 0;
  const historyWithdrawalsPages = historyWData?.data?.pages ?? 1;

  const totalWithdrawalsCount =
    pendingWithdrawalsTotal + historyWithdrawalsTotal;

  const earnings = earningsData?.data?.data?.earnings ?? [];
  const totalE = earningsData?.data?.total ?? 0;
  const totalEPages = Math.ceil(totalE / PAGE_SIZE);

  const availableETB = wallet ? wallet.availableBalanceCents / 100 : 0;

  const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
  const lastPayoutAt = user?.lastPayoutRequestAt
    ? new Date(user.lastPayoutRequestAt)
    : null;
  const nextAvailableAt = lastPayoutAt
    ? new Date(lastPayoutAt.getTime() + COOLDOWN_MS)
    : null;
  const cooldownActive = nextAvailableAt ? nextAvailableAt > new Date() : false;
  const hasPendingWithdrawal = pendingWithdrawalsTotal > 0;
  const canWithdraw =
    availableETB >= 10 && !cooldownActive && !hasPendingWithdrawal;

  const withdrawalsLoading = pendingWLoading || historyWLoading;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({
      queryKey: hostQueryKeys.wallet.all(),
    });
    void queryClient.invalidateQueries({ queryKey: hostQueryKeys.dashboard() });
  };

  const resetWithdrawalPaging = () => {
    setPendingWithdrawalsPage(1);
    setHistoryWithdrawalsPage(1);
  };

  const walletActivityRef = useRef<HTMLDivElement>(null);

  const scrollToStatement = () => {
    setActiveTab("earnings");
    setSearch("");
    resetWithdrawalPaging();
    requestAnimationFrame(() => {
      walletActivityRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const exportEarningsCSV = () => {
    if (!earnings.length) {
      toast.error("No earnings records to export.");
      return;
    }
    const headers = [
      "Date",
      "Type",
      "Status",
      "Experience",
      "Gross (ETB)",
      "Platform Fee 15% (ETB)",
      "Net Payout (ETB)",
    ];
    const rows = earnings.map((e) => [
      new Date(e.date).toLocaleDateString("en-US"),
      e.type,
      e.status,
      `"${(e.booking?.experience?.title || "Hosted Experience").replace(/"/g, '""')}"`,
      (e.grossCents / 100).toFixed(2),
      (e.feeCents / 100).toFixed(2),
      (e.netCents / 100).toFixed(2),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Endebeto_Host_Statement_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Statement CSV exported successfully.");
  };

  const legalHostName = (user?.hostApplicationData?.fullName ?? "").trim();

  return {
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
    exportEarningsCSV,
  };
}
