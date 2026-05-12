import { ArrowUp, FileText, Users, Wallet } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import type { PlatformStats } from "@/services/admin.service";
import { fmtEtb, fmtNum } from "./dashboardUtils";

export function DashboardOperationalSection({
  stats,
}: {
  stats: PlatformStats;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white dark:bg-[#2d3133] p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-headline font-extrabold text-primary flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" /> Host applications
            queue
          </h3>
          <RouterLink
            to="/admin/host-applications"
            className="text-[11px] font-bold text-primary hover:underline"
          >
            View all →
          </RouterLink>
        </div>
        <div className="flex items-end gap-4">
          <div>
            <p className="font-headline font-extrabold text-3xl text-primary leading-none">
              {fmtNum(stats.pendingApplications)}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">
              {stats.pendingApplications === 1 ? "application" : "applications"}{" "}
              awaiting review
            </p>
          </div>
          <RouterLink
            to="/admin/host-applications"
            className="ml-auto px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Review queue
          </RouterLink>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2d3133] p-5 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col">
        <h3 className="font-headline font-extrabold text-sm text-primary mb-1 flex items-center gap-1.5">
          <Wallet className="h-4 w-4 text-emerald-600" /> Payouts
        </h3>
        <p className="text-[11px] text-on-surface-variant mb-3">
          {fmtEtb(stats.pendingWithdrawalsCents)} ETB queued across{" "}
          {stats.pendingWithdrawalsCount} request
          {stats.pendingWithdrawalsCount === 1 ? "" : "s"}.
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <RouterLink
            to="/admin/payouts"
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <ArrowUp className="h-3.5 w-3.5" /> Payouts
          </RouterLink>
          <RouterLink
            to="/admin/users"
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/5 text-primary text-xs font-bold rounded-xl hover:bg-primary/10 transition-colors"
          >
            <Users className="h-3.5 w-3.5" /> Users
          </RouterLink>
        </div>
      </div>
    </section>
  );
}
