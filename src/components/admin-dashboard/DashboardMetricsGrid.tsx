import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CircleDollarSign,
  Clock,
  Compass,
  FileText,
  ShieldOff,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { PlatformStats } from "@/services/admin.service";
import { DeltaBadge } from "@/components/admin/DeltaBadge";
import { fmtEtb, fmtNum } from "./dashboardUtils";
import { HeroCard, KpiTile } from "./DashboardCards";

export function DashboardMetricsGrid({
  stats,
  compareSuffix,
}: {
  stats: PlatformStats;
  compareSuffix: string;
}) {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <HeroCard
          label="Gross Revenue"
          value={`${fmtEtb(stats.grossRevenueCents)} ETB`}
          tone="dark"
          icon={<CircleDollarSign className="h-5 w-5" />}
          sub={`Lifetime across ${fmtNum(
            stats.upcomingBookings + stats.completedBookings,
          )} paid bookings`}
        >
          <DeltaBadge
            curr={stats.grossRevenueCurrCents}
            prev={stats.grossRevenuePrevCents}
            suffix={compareSuffix}
            className="!text-white/90"
          />
        </HeroCard>

        <HeroCard
          label={`Platform Fees (${Math.round(
            (stats.platformFeeRate ?? 0.15) * 100,
          )}%)`}
          value={`${fmtEtb(stats.platformFeesCents)} ETB`}
          icon={<Banknote className="h-5 w-5" />}
          sub="Lifetime fee revenue from all paid bookings"
        >
          <DeltaBadge
            curr={stats.platformFeesCurrCents}
            prev={stats.platformFeesPrevCents}
            suffix={compareSuffix}
          />
        </HeroCard>

        <HeroCard
          label="Pending Payouts"
          value={`${fmtEtb(stats.pendingWithdrawalsCents)} ETB`}
          icon={<Wallet className="h-5 w-5" />}
          sub={`${stats.pendingWithdrawalsCount} pending · ${fmtEtb(
            stats.paidWithdrawalsLifetimeCents,
          )} ETB paid lifetime`}
        >
          {stats.failedWithdrawalsCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
              <AlertTriangle className="h-3 w-3" />
              {stats.failedWithdrawalsCount} failed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant">
              <Clock className="h-3 w-3" /> No failed transfers
            </span>
          )}
        </HeroCard>

        <HeroCard
          label="Avg Booking Value"
          value={`${fmtEtb(stats.avgBookingValueCents)} ETB`}
          icon={<TrendingUp className="h-5 w-5" />}
          sub={`Upcoming: ${fmtNum(
            stats.upcomingBookings,
          )} · Cancelled: ${fmtNum(stats.cancelledBookings)}`}
        />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile
          label="Total Users"
          value={fmtNum(stats.totalUsers)}
          icon={<Users className="h-4 w-4" />}
        >
          <DeltaBadge
            curr={stats.newUsersCurr}
            prev={stats.newUsersPrev}
            suffix={compareSuffix}
          />
        </KpiTile>

        <KpiTile
          label="Approved Hosts"
          value={fmtNum(stats.approvedHosts)}
          icon={<Compass className="h-4 w-4" />}
          accent="text-emerald-600"
        >
          <DeltaBadge
            curr={stats.newHostsCurr}
            prev={stats.newHostsPrev}
            suffix={compareSuffix}
          />
        </KpiTile>

        <KpiTile
          label="Total Bookings"
          value={fmtNum(stats.totalBookings)}
          icon={<BarChart3 className="h-4 w-4" />}
        >
          <DeltaBadge
            curr={stats.bookingsCurr}
            prev={stats.bookingsPrev}
            suffix={compareSuffix}
          />
        </KpiTile>

        <KpiTile
          label="Avg Rating"
          value={
            stats.avgPlatformRating > 0
              ? stats.avgPlatformRating.toFixed(2)
              : "—"
          }
          icon={<Star className="h-4 w-4" />}
          accent="text-amber-600"
        >
          <p className="text-[11px] text-on-surface-variant">
            {fmtNum(stats.totalReviews)} reviews ·{" "}
            <span className="font-bold text-primary">
              +{fmtNum(stats.reviewsCurr)}
            </span>{" "}
            {compareSuffix.replace("vs", "in")}
          </p>
        </KpiTile>

        <KpiTile
          label="Suspended Users"
          value={fmtNum(stats.suspendedUsers)}
          icon={<ShieldOff className="h-4 w-4" />}
          accent="text-rose-600"
        >
          <p className="text-[11px] text-on-surface-variant">
            Blocked from login
          </p>
        </KpiTile>

        <KpiTile
          label="Drafts / Pending"
          value={`${fmtNum(stats.draftExperiences)} / ${fmtNum(
            stats.pendingExperiences,
          )}`}
          icon={<FileText className="h-4 w-4" />}
        >
          <p className="text-[11px] text-on-surface-variant">
            Drafts · awaiting approval
          </p>
        </KpiTile>

        <KpiTile
          label="Live Experiences"
          value={fmtNum(stats.liveExperiences)}
          icon={<Compass className="h-4 w-4" />}
          accent="text-emerald-600"
        >
          <p className="text-[11px] text-on-surface-variant">
            Expired:{" "}
            <span className="font-bold text-stone-600 dark:text-stone-400">
              {fmtNum(stats.expiredExperiences)}
            </span>
            {" · "}
            Suspended:{" "}
            <span className="font-bold text-amber-700">
              {fmtNum(stats.suspendedExperiences)}
            </span>
          </p>
        </KpiTile>

        <KpiTile
          label="Applications"
          value={fmtNum(stats.pendingApplications)}
          icon={<FileText className="h-4 w-4" />}
          accent="text-sky-600"
        >
          <p className="text-[11px] text-on-surface-variant">
            Host onboarding queue
          </p>
        </KpiTile>
      </section>
    </>
  );
}
