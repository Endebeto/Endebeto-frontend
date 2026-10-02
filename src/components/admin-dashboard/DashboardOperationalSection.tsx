import { ArrowUp, CalendarCheck, FileText, Wallet } from "lucide-react";
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
      {/* Host Applications Queue */}
      <div className="bg-white dark:bg-[#2d3133] p-5 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-headline font-extrabold text-primary flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" /> Host applications
          </h3>
          <RouterLink
            to="/admin/host-applications"
            className="text-[11px] font-bold text-primary hover:underline"
          >
            View all →
          </RouterLink>
        </div>
        <div>
          <p className="font-headline font-extrabold text-3xl text-primary leading-none">
            {fmtNum(stats.pendingApplications)}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1 mb-4">
            {stats.pendingApplications === 1 ? "application" : "applications"}{" "}
            awaiting review
          </p>
        </div>
        <div className="mt-auto">
          <RouterLink
            to="/admin/host-applications"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Review queue
          </RouterLink>
        </div>
      </div>

      {/* Payouts */}
      <div className="bg-white dark:bg-[#2d3133] p-5 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline font-extrabold text-sm text-primary flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-emerald-600" /> Payouts
          </h3>
          <RouterLink
            to="/admin/payouts"
            className="text-[11px] font-bold text-primary hover:underline"
          >
            View all →
          </RouterLink>
        </div>
        <div>
          <p className="font-headline font-extrabold text-3xl text-emerald-600 leading-none">
            {stats.pendingWithdrawalsCount}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1 mb-4">
            {fmtEtb(stats.pendingWithdrawalsCents)} ETB queued for disbursement
          </p>
        </div>
        <div className="mt-auto">
          <RouterLink
            to="/admin/payouts"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <ArrowUp className="h-3.5 w-3.5" /> Process Payouts
          </RouterLink>
        </div>
      </div>

      {/* Bookings Management */}
      <div className="bg-white dark:bg-[#2d3133] p-5 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline font-extrabold text-sm text-primary flex items-center gap-1.5">
            <CalendarCheck className="h-4 w-4 text-blue-600" /> Bookings
          </h3>
          <RouterLink
            to="/admin/bookings"
            className="text-[11px] font-bold text-primary hover:underline"
          >
            View all →
          </RouterLink>
        </div>
        <div>
          <p className="font-headline font-extrabold text-3xl text-primary leading-none">
            {fmtNum(stats.upcomingBookings)}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1 mb-4">
            Upcoming sessions ({fmtNum(stats.totalBookings)} total platform
            reservations)
          </p>
        </div>
        <div className="mt-auto">
          <RouterLink
            to="/admin/bookings"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <CalendarCheck className="h-3.5 w-3.5" /> Manage Bookings
          </RouterLink>
        </div>
      </div>
    </section>
  );
}
