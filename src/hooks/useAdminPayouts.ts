import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService, type AdminWithdrawal } from "@/services/admin.service";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import { fmtETB, PAGE_SIZE } from "@/components/admin-payouts/payoutUtils";

export function useAdminPayouts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [failTarget, setFailTarget] = useState<AdminWithdrawal | null>(null);
  const [paidTarget, setPaidTarget] = useState<AdminWithdrawal | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [revealedAccounts, setRevealedAccounts] = useState<
    Record<string, string>
  >({});
  const [revealingId, setRevealingId] = useState<string | null>(null);

  const searchTrim = search.trim();

  const { data: historyApi, isLoading: historyLoading, isError: historyErr } =
    useQuery({
      queryKey: adminQueryKeys.withdrawals({
        tab: "history",
        page: historyPage,
        search: searchTrim,
      }),
      queryFn: () =>
        adminService
          .getWithdrawals({
            tab: "history",
            page: historyPage,
            limit: PAGE_SIZE,
            q: searchTrim || undefined,
          })
          .then((r) => r.data),
      staleTime: 30_000,
    });

  const { data: pendingApi, isLoading: pendingLoading, isError: pendingErr } =
    useQuery({
      queryKey: adminQueryKeys.withdrawals({
        tab: "pending",
        page: pendingPage,
        search: searchTrim,
      }),
      queryFn: () =>
        adminService
          .getWithdrawals({
            tab: "pending",
            page: pendingPage,
            limit: PAGE_SIZE,
            q: searchTrim || undefined,
          })
          .then((r) => r.data),
      staleTime: 30_000,
    });

  const isLoading = historyLoading || pendingLoading;
  const isError = historyErr || pendingErr;

  const dashboardTotals =
    pendingApi?.dashboardTotals ??
    historyApi?.dashboardTotals ?? {
      pendingCount: 0,
      pendingAmountCents: 0,
      failedCount: 0,
      paidTotalCents: 0,
    };

  const paidTotal = fmtETB(dashboardTotals.paidTotalCents ?? 0);
  const pendingCount = dashboardTotals.pendingCount ?? 0;
  const pendingAmount = fmtETB(dashboardTotals.pendingAmountCents ?? 0);
  const failedCount = dashboardTotals.failedCount ?? 0;

  const historyWithdrawals: AdminWithdrawal[] =
    historyApi?.data.withdrawals ?? [];
  const historyTotal = historyApi?.total ?? 0;
  const historyTotalPages = Math.max(1, historyApi?.pages ?? 1);

  const pendingWithdrawals: AdminWithdrawal[] =
    pendingApi?.data.withdrawals ?? [];
  const pendingTotal = pendingApi?.total ?? 0;
  const pendingTotalPages = Math.max(1, pendingApi?.pages ?? 1);

  const markPaidMutation = useMutation({
    mutationFn: ({
      id,
      paymentReceiptUrl,
    }: {
      id: string;
      paymentReceiptUrl?: string;
    }) => adminService.markWithdrawalPaid(id, paymentReceiptUrl),
    onSuccess: () => {
      toast.success("Withdrawal marked as paid");
      qc.invalidateQueries({ queryKey: adminQueryKeys.withdrawalsPrefix });
      setPaidTarget(null);
    },
    onError: () => toast.error("Failed to mark as paid"),
  });

  const markFailedMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.markWithdrawalFailed(id, reason),
    onSuccess: () => {
      toast.success("Withdrawal marked as failed");
      qc.invalidateQueries({ queryKey: adminQueryKeys.withdrawalsPrefix });
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

  const handleReveal = async (wrId: string) => {
    if (revealedAccounts[wrId]) {
      setRevealedAccounts((prev) => {
        const next = { ...prev };
        delete next[wrId];
        return next;
      });
      return;
    }
    setRevealingId(wrId);
    try {
      const res = await adminService.revealWithdrawalAccount(wrId);
      const full = res.data.data.accountNumber ?? "—";
      setRevealedAccounts((prev) => ({ ...prev, [wrId]: full }));
    } catch {
      toast.error("Could not reveal account number. Please try again.");
    } finally {
      setRevealingId(null);
    }
  };

  const onSearch = (v: string) => {
    setSearch(v);
    setHistoryPage(1);
    setPendingPage(1);
  };

  return {
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
  };
}
