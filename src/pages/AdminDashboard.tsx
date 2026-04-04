import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ArrowUp, Users, Compass, FileText, Loader2, BarChart3 } from "lucide-react";
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
} from "recharts";
import AdminLayout from "@/components/AdminLayout";
import { adminService, type PlatformStats } from "@/services/admin.service";

/* ─── icon helper ────────────────────────────────────────── */
function StatIcon({ type }: { type: string }) {
  const cls = "h-4 w-4";
  if (type === "users")   return <Users    className={cls} />;
  if (type === "compass") return <Compass  className={cls} />;
  if (type === "apps")    return <FileText className={cls} />;
  if (type === "exp")     return <FileText className={cls} />;
  return <TrendingUp className={cls} />;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function fmtETB(cents: number) {
  const etb = cents / 100;
  if (etb >= 1_000_000) return `${(etb / 1_000_000).toFixed(1)}M`;
  if (etb >= 1_000) return `${(etb / 1_000).toFixed(1)}k`;
  return etb.toFixed(0);
}

function BarTooltipBody({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
  label?: string;
}) {
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
            <span className="font-bold tabular-nums text-on-surface">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PieTooltipBody({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const n = Number(row.value);
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-white dark:bg-zinc-800 px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-on-surface">{row.name}</p>
      <p className="text-on-surface-variant">
        <span className="font-semibold tabular-nums text-primary">{Number.isFinite(n) ? n : 0}</span> listings
      </p>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [search, setSearch] = useState("");

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.getStats().then(r => r.data.data),
    staleTime: 60_000,
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ["admin-dashboard-charts"],
    queryFn: () => adminService.getDashboardCharts({ months: 6 }).then((r) => r.data.data),
    staleTime: 120_000,
  });

  const chartRows =
    chartsData?.labels.map((label, i) => ({
      month: label,
      signups: chartsData.newUsers[i] ?? 0,
      bookings: chartsData.bookings[i] ?? 0,
    })) ?? [];

  const stats: PlatformStats = statsData ?? {
    totalUsers: 0,
    newUsersThisMonth: 0,
    approvedHosts: 0,
    totalBookings: 0,
    grossRevenue: 0,
    platformFeesCollected: 0,
    pendingApplications: 0,
    draftExperiences: 0,
    liveExperiences: 0,
    suspendedExperiences: 0,
  };

  const statCards = [
    { label: "Total Users",        value: fmt(stats.totalUsers),          sub: `+${stats.newUsersThisMonth} this month`, subType: "trend",  icon: "users" },
    { label: "Active Experiences", value: fmt(stats.liveExperiences), sub: "Live & bookable",                        subType: "trend",  icon: "compass" },
    { label: "Pending Apps",       value: fmt(stats.pendingApplications), sub: "Action needed",                          subType: "action", icon: "apps" },
    { label: "Draft Listings",     value: fmt(stats.draftExperiences),      sub: "Unpublished",                            subType: "trend",  icon: "exp" },
    { label: "Total Bookings",     value: fmt(stats.totalBookings),       sub: `${fmtETB(stats.grossRevenue)} ETB gross`, subType: "trend", icon: "bookings", dark: true },
  ];

  return (
    <AdminLayout
      searchPlaceholder="Search activities, hosts, or users..."
      searchValue={search}
      onSearch={setSearch}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-4 md:space-y-6">

          {/* ── Stat cards ── */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {isLoading ? (
              <div className="col-span-5 flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : statCards.map((s) => (
              <div
                key={s.label}
                className={`p-4 rounded-2xl flex flex-col gap-2 ${
                  s.dark
                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                    : "bg-white dark:bg-[#2d3133] shadow-sm border border-outline-variant/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${s.dark ? "text-white/60" : "text-on-surface-variant"}`}>
                    {s.label}
                  </span>
                  <span className={s.dark ? "text-white/40" : "text-on-surface-variant/40"}>
                    <StatIcon type={s.icon} />
                  </span>
                </div>
                <span className={`text-2xl font-headline font-extrabold ${s.dark ? "text-white" : "text-primary"}`}>
                  {s.value}
                </span>
                {s.subType === "trend" ? (
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${s.dark ? "text-emerald-300" : "text-emerald-600"}`}>
                    <TrendingUp className="h-3 w-3" /> {s.sub}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded-full w-fit">
                    {s.sub}
                  </span>
                )}
              </div>
            ))}
          </section>

          {/* ── Charts ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {chartsLoading ? (
              <div className="lg:col-span-2 flex justify-center py-12 bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 p-4 md:p-6 shadow-sm">
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h2 className="font-headline font-extrabold text-sm text-primary">Activity by month</h2>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1 pl-7 leading-relaxed">
                      New user accounts created vs bookings recorded in each calendar month (last 6 months). Vertical axis is a count.
                    </p>
                  </div>
                  <div className="h-[260px] w-full min-h-[200px]">
                    {chartRows.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartRows} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11 }}
                            width={40}
                            label={{ value: "Count", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "var(--muted-foreground, #64748b)" } }}
                          />
                          <Tooltip content={(props) => <BarTooltipBody {...props} />} />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                          <Bar dataKey="signups" name="New users" fill="rgb(0, 82, 52)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="bookings" name="Bookings" fill="rgb(16, 185, 129)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-on-surface-variant text-center py-12">No chart data yet.</p>
                    )}
                  </div>
                </div>
                {!isLoading && (
                  <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 p-4 md:p-6 shadow-sm">
                    <div className="mb-3">
                      <h2 className="font-headline font-extrabold text-sm text-primary">Experience listings</h2>
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                        Share of catalog states today — live (bookable), suspended (hidden from guests), or draft. Numbers appear on each slice and in the legend.
                      </p>
                    </div>
                    <div className="h-[260px] w-full min-h-[200px]">
                      {(() => {
                        const expMix = [
                          { name: "Live", value: stats.liveExperiences, color: "#005234" },
                          { name: "Suspended", value: stats.suspendedExperiences, color: "#b45309" },
                          { name: "Drafts", value: stats.draftExperiences, color: "#64748b" },
                        ].filter((d) => d.value > 0);
                        const total = expMix.reduce((s, d) => s + d.value, 0);
                        if (total === 0) {
                          return <p className="text-xs text-on-surface-variant text-center py-12">No experiences yet.</p>;
                        }
                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={expMix}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={48}
                                outerRadius={82}
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
                                  formatter={(v: number) => (v > 0 ? String(v) : "")}
                                />
                              </Pie>
                              <Tooltip content={(props) => <PieTooltipBody {...props} />} />
                              <Legend
                                verticalAlign="bottom"
                                formatter={(value, entry) => {
                                  const v = (entry as { payload?: { value?: number } }).payload?.value;
                                  return `${value} (${v ?? 0})`;
                                }}
                                wrapperStyle={{ fontSize: "12px", paddingTop: 8 }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── Platform fee highlight ── */}
          {!isLoading && (
            <section className="bg-primary/5 border border-primary/10 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5">Platform Fees Collected</p>
                <p className="font-headline font-extrabold text-2xl text-primary">
                  {fmtETB(stats.platformFeesCollected)} <span className="text-sm font-normal">ETB</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">Gross Revenue</p>
                <p className="font-headline font-bold text-lg text-on-surface">{fmtETB(stats.grossRevenue)} ETB</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">15% platform fee on all bookings</p>
              </div>
            </section>
          )}

          {/* ── Bottom row ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left: pending applications preview */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white dark:bg-[#2d3133] rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <h3 className="font-headline font-extrabold text-base text-primary">Pending Host Applications</h3>
                  <RouterLink
                    to="/admin/host-applications"
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    View All
                  </RouterLink>
                </div>
                <div className="px-6 py-8 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-headline font-extrabold text-3xl text-primary">
                    {isLoading ? "–" : stats.pendingApplications}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {stats.pendingApplications === 1 ? "application" : "applications"} awaiting review
                  </p>
                  <RouterLink
                    to="/admin/host-applications"
                    className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Review Applications
                  </RouterLink>
                </div>
              </div>

              {/* Experience management CTA */}
              <div className="bg-white dark:bg-[#2d3133] p-5 rounded-3xl shadow-sm">
                <h3 className="text-sm font-headline font-bold text-primary mb-2 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-emerald-600" />
                  Experience Management
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  Monitor live listings, suspensions, drafts, and rejected items. Suspend listings to hide them from guests while hosts fix issues.
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      <span className="font-headline font-extrabold text-lg text-primary">{isLoading ? "–" : stats.liveExperiences}</span>
                      {" "}live ·{" "}
                      <span className="font-headline font-extrabold text-lg text-amber-700">{isLoading ? "–" : stats.suspendedExperiences}</span>
                      {" "}suspended ·{" "}
                      <span className="font-headline font-extrabold text-lg text-primary">{isLoading ? "–" : stats.draftExperiences}</span>
                      {" "}drafts
                    </p>
                  </div>
                  <RouterLink
                    to="/admin/experiences"
                    className="shrink-0 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Open catalog
                  </RouterLink>
                </div>
              </div>
            </div>

            {/* Right: marketplace health */}
            <div className="bg-white dark:bg-[#2d3133] p-6 rounded-3xl shadow-sm flex flex-col">
              <h3 className="font-headline font-extrabold text-base text-primary mb-0.5">Marketplace Health</h3>
              <p className="text-xs text-on-surface-variant mb-6">Platform overview</p>

              <div className="space-y-4">
                {[
                  { label: "Total Users",          value: fmt(stats.totalUsers),          icon: "users",   color: "text-primary" },
                  { label: "Approved Hosts",        value: fmt(stats.approvedHosts),        icon: "compass", color: "text-emerald-600" },
                  { label: "Live Experiences",    value: fmt(stats.liveExperiences),  icon: "exp",     color: "text-on-surface" },
                  { label: "Suspended (hidden)", value: fmt(stats.suspendedExperiences), icon: "exp", color: "text-amber-700" },
                  { label: "Total Bookings",        value: fmt(stats.totalBookings),        icon: "bookings",color: "text-on-surface" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                    <span className="text-sm text-on-surface-variant">{item.label}</span>
                    <span className={`font-headline font-extrabold text-lg ${item.color}`}>
                      {isLoading ? "–" : item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <RouterLink
                  to="/admin/users"
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary/5 text-primary text-xs font-bold rounded-xl hover:bg-primary/10 transition-colors"
                >
                  <Users className="h-3.5 w-3.5" /> Manage Users
                </RouterLink>
                <RouterLink
                  to="/admin/payouts"
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <ArrowUp className="h-3.5 w-3.5" /> Payouts
                </RouterLink>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
