import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Users,
  Compass,
  FileText,
  Loader2,
  BarChart3,
  Wallet,
  CircleDollarSign,
  Banknote,
  Star,
  AlertTriangle,
  ShieldOff,
  ArrowUp,
  Clock,
  Award,
  Trophy,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList,
  AreaChart,
  Area,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import AdminLayout from "@/components/AdminLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { DeltaBadge } from "@/components/admin/DeltaBadge";
import {
  adminService,
  type CompareWindow,
  type PlatformStats,
  type TopExperience,
  type TopHost,
} from "@/services/admin.service";

/* ─── formatters ─────────────────────────────────────────── */
function fmtNum(n: number) {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

/** All money numbers from the backend are in cents. */
function fmtEtb(cents: number) {
  const etb = (cents ?? 0) / 100;
  if (!Number.isFinite(etb)) return "0";
  if (Math.abs(etb) >= 1_000_000) return `${(etb / 1_000_000).toFixed(1)}M`;
  if (Math.abs(etb) >= 1_000) return `${(etb / 1_000).toFixed(1)}k`;
  return etb.toFixed(0);
}

function fmtEtbFull(cents: number) {
  const etb = (cents ?? 0) / 100;
  return etb.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Chart series values are already ETB (API cents were divided by 100 in the row builder). */
function fmtEtbMajorUnits(etb: number) {
  if (!Number.isFinite(etb)) return "0";
  return etb.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Y-axis tick labels for large ETB amounts (not dollar-scale). */
function formatEtbAxisTick(v: number) {
  if (!Number.isFinite(v)) return "";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return v.toFixed(0);
}

/**
 * Top of Y domain: peak (revenue or fees for current toggle) + headroom, rounded to a
 * readable step so lines sit lower than the top edge for multi‑digit birr values.
 */
function computeEtbAreaYMax(
  rows: { revenue: number; fees: number }[],
  key: "revenue" | "fees",
) {
  if (!rows.length) return 10_000;
  const peak = Math.max(0, ...rows.map((r) => Number(r[key]) || 0));
  if (peak === 0) return 5_000;
  const target = peak * 1.28;
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(target, 1)));
  const step = Math.max(magnitude / 5, 500);
  return Math.ceil(target / step) * step;
}

const EMPTY_STATS: PlatformStats = {
  totalUsers: 0,
  approvedHosts: 0,
  suspendedUsers: 0,
  totalBookings: 0,
  upcomingBookings: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  pendingApplications: 0,
  draftExperiences: 0,
  pendingExperiences: 0,
  liveExperiences: 0,
  suspendedExperiences: 0,

  grossRevenueCents: 0,
  platformFeesCents: 0,
  avgBookingValueCents: 0,

  newUsersCurr: 0,
  newUsersPrev: 0,
  newHostsCurr: 0,
  newHostsPrev: 0,
  bookingsCurr: 0,
  bookingsPrev: 0,
  grossRevenueCurrCents: 0,
  grossRevenuePrevCents: 0,
  platformFeesCurrCents: 0,
  platformFeesPrevCents: 0,

  pendingWithdrawalsCount: 0,
  pendingWithdrawalsCents: 0,
  paidWithdrawalsLifetimeCents: 0,
  failedWithdrawalsCount: 0,

  totalReviews: 0,
  reviewsCurr: 0,
  avgPlatformRating: 0,

  platformFeeRate: 0.15,
  compareWindow: "rolling30",
  windows: {
    curr: { start: "", end: "" },
    prev: { start: "", end: "" },
  },
};

/* Align with Recharts generic tooltip payload (ValueType / NameType) */
type ChartTooltipProps = TooltipProps<ValueType, NameType>;

/* ─── tooltips ───────────────────────────────────────────── */
function BarTooltipBody({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs shadow-lg max-w-[220px]">
      <p className="font-headline font-bold text-primary mb-1.5 border-b border-outline-variant/10 pb-1">
        {label}
      </p>
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={String(p.name)} className="flex justify-between gap-6">
            <span className="text-on-surface-variant">{p.name}</span>
            <span className="font-bold tabular-nums text-on-surface">
              {p.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AreaTooltipBody({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs shadow-lg max-w-[220px]">
      <p className="font-headline font-bold text-primary mb-1.5 border-b border-outline-variant/10 pb-1">
        {label}
      </p>
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={String(p.name)} className="flex justify-between gap-6">
            <span className="text-on-surface-variant">{p.name}</span>
            <span className="font-bold tabular-nums text-on-surface">
              {fmtEtbMajorUnits(Number(p.value ?? 0))} ETB
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PieTooltipBody({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const n = Number(row.value);
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-white dark:bg-zinc-800 px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-on-surface">{row.name}</p>
      <p className="text-on-surface-variant">
        <span className="font-semibold tabular-nums text-primary">
          {Number.isFinite(n) ? n : 0}
        </span>{" "}
        listings
      </p>
    </div>
  );
}

/* ─── hero card ──────────────────────────────────────────── */
function HeroCard({
  label,
  value,
  sub,
  tone = "light",
  icon,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "light" | "dark";
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-2 shadow-sm ${
        tone === "dark"
          ? "bg-primary text-white shadow-xl shadow-primary/20"
          : "bg-white dark:bg-[#2d3133] border border-outline-variant/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            tone === "dark" ? "text-white/70" : "text-on-surface-variant"
          }`}
        >
          {label}
        </span>
        <span
          className={tone === "dark" ? "text-white/60" : "text-primary/60"}
        >
          {icon}
        </span>
      </div>
      <p
        className={`font-headline font-extrabold text-2xl md:text-[28px] leading-none ${
          tone === "dark" ? "text-white" : "text-primary"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[11px] ${
            tone === "dark" ? "text-white/80" : "text-on-surface-variant"
          }`}
        >
          {sub}
        </p>
      )}
      {children && <div className="mt-0.5">{children}</div>}
    </div>
  );
}

function KpiTile({
  label,
  value,
  icon,
  accent,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#2d3133] border border-outline-variant/10 shadow-sm flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <span className={`${accent ?? "text-primary/60"}`}>{icon}</span>
      </div>
      <p className="font-headline font-extrabold text-xl text-primary leading-none">
        {value}
      </p>
      {children && <div>{children}</div>}
    </div>
  );
}

/* ─── top experiences card ───────────────────────────────── */
function TopExperiencesCard() {
  const [by, setBy] = useState<"revenue" | "bookings" | "rating">("revenue");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-top-experiences", by],
    queryFn: () =>
      adminService
        .getTopExperiences({ limit: 5, by })
        .then((r) => (Array.isArray(r.data.data) ? r.data.data : [])),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const rows: TopExperience[] = data ?? [];

  return (
    <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-outline-variant/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="h-4 w-4 text-amber-600 shrink-0" />
          <h3 className="font-headline font-extrabold text-sm text-primary truncate">
            Top Experiences
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-0.5">
          {(
            [
              { id: "revenue", label: "Revenue" },
              { id: "bookings", label: "Bookings" },
              { id: "rating", label: "Rating" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setBy(opt.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors ${
                by === opt.id
                  ? "bg-white dark:bg-[#3a4042] text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-outline-variant/10">
        {isLoading && !rows.length ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary/70" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-8">
            No experiences with{" "}
            {by === "rating" ? "reviews" : "paid bookings"} yet.
          </p>
        ) : (
          rows.map((row, i) => (
            <RouterLink
              key={row._id}
              to="/admin/experiences"
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors"
            >
              <span className="w-5 text-center text-xs font-bold text-on-surface-variant tabular-nums">
                {i + 1}
              </span>
              {row.imageCover ? (
                <img
                  src={row.imageCover}
                  alt={row.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Compass className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">
                  {row.title}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {row.host?.name ?? "Unknown host"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {by === "rating" ? (
                  <>
                    <p className="text-xs font-bold text-primary flex items-center gap-0.5 justify-end tabular-nums">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {(row.ratingsAverage ?? 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {row.ratingsQuantity ?? 0} rating
                      {(row.ratingsQuantity ?? 0) === 1 ? "" : "s"}
                    </p>
                  </>
                ) : by === "bookings" ? (
                  <>
                    <p className="text-xs font-bold text-primary tabular-nums">
                      {fmtNum(row.bookings)}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {fmtEtb(row.grossCents)} ETB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-primary tabular-nums">
                      {fmtEtb(row.grossCents)} ETB
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {fmtNum(row.bookings)} bookings
                    </p>
                  </>
                )}
              </div>
            </RouterLink>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── top hosts card ─────────────────────────────────────── */
function TopHostsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-top-hosts"],
    queryFn: () =>
      adminService
        .getTopHosts({ limit: 5 })
        .then((r) => (Array.isArray(r.data.data) ? r.data.data : [])),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const rows: TopHost[] = data ?? [];

  return (
    <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-outline-variant/10 flex items-center gap-2">
        <Award className="h-4 w-4 text-emerald-600" />
        <h3 className="font-headline font-extrabold text-sm text-primary">
          Top Hosts by Revenue
        </h3>
      </div>

      <div className="divide-y divide-outline-variant/10">
        {isLoading && !rows.length ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary/70" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-8">
            No hosts with paid bookings yet.
          </p>
        ) : (
          rows.map((row, i) => (
            <RouterLink
              key={row._id}
              to="/admin/users"
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors"
            >
              <span className="w-5 text-center text-xs font-bold text-on-surface-variant tabular-nums">
                {i + 1}
              </span>
              <UserAvatar
                name={row.name}
                photo={row.photo}
                className="w-10 h-10 rounded-full bg-primary/10"
                initialsClassName="text-primary text-xs"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">
                  {row.name ?? "Unknown"}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {row.experiencesCount} experience
                  {row.experiencesCount === 1 ? "" : "s"} ·{" "}
                  {fmtNum(row.bookings)} bookings
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-primary tabular-nums">
                  {fmtEtb(row.grossCents)} ETB
                </p>
                <p className="text-[10px] text-on-surface-variant">gross</p>
              </div>
            </RouterLink>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [compare, setCompare] = useState<CompareWindow>("rolling30");
  const [months, setMonths] = useState<3 | 6 | 12 | 24>(6);
  const [revenueSeries, setRevenueSeries] = useState<"revenue" | "fees">(
    "revenue",
  );

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin-stats", compare],
    queryFn: () =>
      adminService.getStats({ compare }).then((r) => r.data.data),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ["admin-dashboard-charts", months],
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

  const stats: PlatformStats = statsData ?? EMPTY_STATS;

  const compareSuffix =
    compare === "month" ? "vs last month" : "vs prev 30d";

  const expMix = [
    { name: "Live", value: stats.liveExperiences, color: "#005234" },
    { name: "Pending", value: stats.pendingExperiences, color: "#0ea5e9" },
    { name: "Suspended", value: stats.suspendedExperiences, color: "#b45309" },
    { name: "Drafts", value: stats.draftExperiences, color: "#64748b" },
  ].filter((d) => d.value > 0);
  const expMixTotal = expMix.reduce((s, d) => s + d.value, 0);

  return (
    <AdminLayout
      searchPlaceholder="Search activities, hosts, or users..."
      searchValue={search}
      onSearch={setSearch}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
          {/* ── Header controls ── */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-headline font-extrabold text-xl text-primary">
                Platform analytics
              </h1>
              <p className="text-xs text-on-surface-variant">
                Revenue, activity, and marketplace health at a glance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-0.5">
                {(
                  [
                    { id: "rolling30", label: "Rolling 30d" },
                    { id: "month", label: "This month" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCompare(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      compare === opt.id
                        ? "bg-white dark:bg-[#3a4042] text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <select
                value={months}
                onChange={(e) =>
                  setMonths(
                    Number(e.target.value) as 3 | 6 | 12 | 24,
                  )
                }
                className="text-xs font-bold bg-white dark:bg-[#2d3133] border border-outline-variant/20 rounded-xl px-3 py-2 text-primary outline-none hover:border-primary/30 transition-colors"
              >
                <option value={3}>Last 3 months</option>
                <option value={6}>Last 6 months</option>
                <option value={12}>Last 12 months</option>
                <option value={24}>Last 24 months</option>
              </select>
            </div>
          </section>

          {/* ── Hero row ── */}
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

          {/* ── KPI strip ── */}
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

          {/* ── Charts row ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue / Fees trend */}
            <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 p-4 md:p-5 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-5 w-5 text-primary" />
                    <h2 className="font-headline font-extrabold text-sm text-primary">
                      {revenueSeries === "revenue"
                        ? "Gross revenue trend"
                        : "Platform fees trend"}
                    </h2>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1 pl-7 leading-relaxed">
                    Monthly {revenueSeries === "revenue" ? "gross revenue (host + platform fee)" : "platform fees"} from wallet ledger entries, by payment month, over the last {months} months. Matches the same source and dates as the other line. ETB.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-0.5">
                  {(
                    [
                      { id: "revenue", label: "Revenue" },
                      { id: "fees", label: "Fees" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setRevenueSeries(opt.id)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        revenueSeries === opt.id
                          ? "bg-white dark:bg-[#3a4042] text-primary shadow-sm"
                          : "text-on-surface-variant hover:text-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[260px] w-full min-h-[200px]">
                {chartsLoading && !revenueRows.length ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
                  </div>
                ) : revenueRows.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueRows}
                      margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
                    >
                      <defs>
                        <linearGradient
                          id="revGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#005234"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="100%"
                            stopColor="#005234"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="feeGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#b45309"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="100%"
                            stopColor="#b45309"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.06)"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        width={76}
                        domain={[0, revenueAreaYMax]}
                        tickFormatter={(v: number) => formatEtbAxisTick(v)}
                      />
                      <Tooltip
                        content={(props) => <AreaTooltipBody {...props} />}
                      />
                      <Area
                        type="monotone"
                        dataKey={revenueSeries}
                        name={
                          revenueSeries === "revenue" ? "Revenue" : "Fees"
                        }
                        stroke={
                          revenueSeries === "revenue"
                            ? "#005234"
                            : "#b45309"
                        }
                        strokeWidth={2}
                        fill={
                          revenueSeries === "revenue"
                            ? "url(#revGrad)"
                            : "url(#feeGrad)"
                        }
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-on-surface-variant text-center py-12">
                    No revenue data yet.
                  </p>
                )}
              </div>
            </div>

            {/* Experience composition */}
            <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 p-4 md:p-5 shadow-sm">
              <div className="mb-3">
                <h2 className="font-headline font-extrabold text-sm text-primary">
                  Experience listings
                </h2>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Current catalog composition — live, pending approval, suspended, or draft.
                </p>
              </div>
              <div className="h-[260px] w-full min-h-[200px]">
                {isLoading && !statsData ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
                  </div>
                ) : expMixTotal === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-12">
                    No experiences yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expMix}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={42}
                        outerRadius={74}
                        paddingAngle={2}
                      >
                        {expMix.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="inside"
                          fill="#fff"
                          fontSize={12}
                          fontWeight={700}
                          formatter={(v: number) =>
                            v > 0 ? String(v) : ""
                          }
                        />
                      </Pie>
                      <Tooltip
                        content={(props) => <PieTooltipBody {...props} />}
                      />
                      <Legend
                        verticalAlign="bottom"
                        formatter={(value, entry) => {
                          const v = (entry as { payload?: { value?: number } })
                            .payload?.value;
                          return `${value} (${v ?? 0})`;
                        }}
                        wrapperStyle={{ fontSize: "11px", paddingTop: 6 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          {/* ── Activity bar chart ── */}
          <section className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 p-4 md:p-5 shadow-sm">
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="font-headline font-extrabold text-sm text-primary">
                  Activity by month
                </h2>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 pl-7 leading-relaxed">
                New user accounts created vs bookings recorded each month (last{" "}
                {months} months).
              </p>
            </div>
            <div className="h-[260px] w-full min-h-[200px]">
              {chartsLoading && !activityRows.length ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
                </div>
              ) : activityRows.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityRows}
                    margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.06)"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      width={40}
                    />
                    <Tooltip
                      content={(props) => <BarTooltipBody {...props} />}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="signups"
                      name="New users"
                      fill="rgb(0, 82, 52)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="bookings"
                      name="Bookings"
                      fill="rgb(16, 185, 129)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-on-surface-variant text-center py-12">
                  No chart data yet.
                </p>
              )}
            </div>
          </section>

          {/* ── Leaderboards ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopExperiencesCard />
            <TopHostsCard />
          </section>

          {/* ── Operational CTAs ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white dark:bg-[#2d3133] p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-headline font-extrabold text-primary flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" /> Host
                  applications queue
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
                    {stats.pendingApplications === 1
                      ? "application"
                      : "applications"}{" "}
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
        </div>
      </div>
    </AdminLayout>
  );
}
