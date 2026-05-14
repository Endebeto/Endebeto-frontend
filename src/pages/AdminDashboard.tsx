import { DashboardChartsGrid } from "@/components/admin-dashboard/DashboardChartsGrid";
import { DashboardHeaderBar } from "@/components/admin-dashboard/DashboardHeaderBar";
import { DashboardMetricsGrid } from "@/components/admin-dashboard/DashboardMetricsGrid";
import { DashboardOperationalSection } from "@/components/admin-dashboard/DashboardOperationalSection";
import { TopExperiencesCard } from "@/components/admin-dashboard/TopExperiencesCard";
import { TopHostsCard } from "@/components/admin-dashboard/TopHostsCard";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useSyncAdminHeader } from "@/hooks/useSyncAdminHeader";

export default function AdminDashboard() {
  const {
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
  } = useAdminDashboard();

  useSyncAdminHeader({
    searchPlaceholder: "Search activities, hosts, or users...",
    searchValue: search,
    onSearch: setSearch,
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
        <DashboardHeaderBar
          compare={compare}
          setCompare={setCompare}
          months={months}
          setMonths={setMonths}
        />

        <DashboardMetricsGrid
          stats={stats}
          compareSuffix={compareSuffix}
        />

        <DashboardChartsGrid
          months={months}
          revenueSeries={revenueSeries}
          setRevenueSeries={setRevenueSeries}
          chartsLoading={chartsLoading}
          isLoading={isLoading}
          statsData={statsData}
          revenueRows={revenueRows}
          activityRows={activityRows}
          revenueAreaYMax={revenueAreaYMax}
          expMix={expMix}
          expMixTotal={expMixTotal}
        />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopExperiencesCard />
          <TopHostsCard />
        </section>

        <DashboardOperationalSection stats={stats} />
      </div>
    </div>
  );
}
