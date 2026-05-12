import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService, type CompareWindow } from "@/services/admin.service";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import {
  computeEtbAreaYMax,
  EMPTY_STATS,
} from "@/components/admin-dashboard/dashboardUtils";

export function useAdminDashboard() {
  const [search, setSearch] = useState("");
  const [compare, setCompare] = useState<CompareWindow>("rolling30");
  const [months, setMonths] = useState<3 | 6 | 12 | 24>(6);
  const [revenueSeries, setRevenueSeries] = useState<"revenue" | "fees">(
    "revenue",
  );

  const { data: statsData, isLoading } = useQuery({
    queryKey: adminQueryKeys.stats(compare),
    queryFn: () => adminService.getStats({ compare }).then((r) => r.data.data),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: adminQueryKeys.charts(months),
    queryFn: () =>
      adminService
        .getDashboardCharts({ months })
        .then((r) => r.data.data),
    staleTime: 120_000,
    placeholderData: (prev) => prev,
  });

  const activityRows = useMemo(() => {
    const labels = chartsData?.labels;
    if (!Array.isArray(labels) || !labels.length) return [];
    return labels.map((label, i) => ({
      month: label,
      signups: chartsData?.newUsers?.[i] ?? 0,
      bookings: chartsData?.bookings?.[i] ?? 0,
    }));
  }, [chartsData]);

  const revenueRows = useMemo(() => {
    const labels = chartsData?.labels;
    if (!Array.isArray(labels) || !labels.length) return [];
    return labels.map((label, i) => ({
      month: label,
      revenue: (chartsData?.revenueCents?.[i] ?? 0) / 100,
      fees: (chartsData?.feesCents?.[i] ?? 0) / 100,
    }));
  }, [chartsData]);

  const revenueAreaYMax = useMemo(
    () => computeEtbAreaYMax(revenueRows, revenueSeries),
    [revenueRows, revenueSeries],
  );

  const stats = statsData ?? EMPTY_STATS;

  const compareSuffix =
    compare === "month" ? "vs last month" : "vs prev 30d";

  const expMix = [
    { name: "Live", value: stats.liveExperiences, color: "#005234" },
    { name: "Pending", value: stats.pendingExperiences, color: "#0ea5e9" },
    { name: "Expired", value: stats.expiredExperiences, color: "#78716c" },
    { name: "Suspended", value: stats.suspendedExperiences, color: "#b45309" },
    { name: "Drafts", value: stats.draftExperiences, color: "#64748b" },
  ].filter((d) => d.value > 0);
  const expMixTotal = expMix.reduce((s, d) => s + d.value, 0);

  return {
    search,
    setSearch,
    compare,
    setCompare,
    months,
    setMonths,
    revenueSeries,
    setRevenueSeries,
    isLoading,
    chartsLoading,
    stats,
    statsData,
    compareSuffix,
    activityRows,
    revenueRows,
    revenueAreaYMax,
    expMix,
    expMixTotal,
  };
}
