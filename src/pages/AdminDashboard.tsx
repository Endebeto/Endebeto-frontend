import { useState } from "react";
import { TrendingUp, Minus, ArrowUp, ShieldCheck, Users, Compass, FileText } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

/* ─── stat cards data ───────────────────────────────────── */
const stats = [
  { label: "Total Users",         value: "1,240", sub: "+5% this week",  subType: "trend",  icon: "users" },
  { label: "Active Experiences",  value: "85",    sub: "+3 this week",   subType: "trend",  icon: "compass" },
  { label: "Pending Apps",        value: "12",    sub: "Action needed",  subType: "action", icon: "apps" },
  { label: "Pending Exp.",        value: "7",     sub: "Action needed",  subType: "action", icon: "exp" },
  { label: "Monthly Bookings",    value: "432",   sub: "+12% growth",    subType: "trend",  icon: "bookings", dark: true },
];

/* ─── chart bars ─────────────────────────────────────────── */
const chartBars = [40, 45, 38, 55, 60, 42, 70, 85, 65, 75, 92, 58, 63, 47, 80, 72, 66, 50, 88, 74, 44, 69, 56, 83, 61, 49, 77, 91, 53, 68];

const revenueRows = [
  { label: "Coffee Tours",          value: "124.5k", pct: 75, shade: "bg-primary" },
  { label: "Highland Trekking",     value: "89.2k",  pct: 55, shade: "bg-emerald-700" },
  { label: "Historical Sites",      value: "62.1k",  pct: 40, shade: "bg-emerald-500" },
  { label: "Culinary Experiences",  value: "45.0k",  pct: 30, shade: "bg-emerald-300" },
];

const pendingApps = [
  { initials: "TA", name: "Tesfaye Alemu",  type: "Coffee Ceremony Masterclass", date: "Oct 28, 2023", color: "bg-secondary-container text-on-secondary-container" },
  { initials: "MG", name: "Marta Gebre",    type: "Lalibela Rock-Hewn Tour",      date: "Oct 27, 2023", color: "bg-tertiary-fixed text-on-tertiary-fixed" },
  { initials: "BD", name: "Berhanu Desta",  type: "Simien Mountains Hiking",      date: "Oct 26, 2023", color: "bg-secondary-container text-on-secondary-container" },
];

const recentApprovals = [
  { title: "Traditional Weaving Workshop", by: "Sarah K." },
  { title: "Blue Nile Falls Expedition",   by: "Abebe B." },
];

const regions = [
  { rank: "01", name: "Addis Ababa", trend: "up" },
  { rank: "02", name: "Lalibela",    trend: "flat" },
  { rank: "03", name: "Gonder",      trend: "up" },
];

const donutSegments = [
  { color: "bg-primary",        label: "Coffee (40%)" },
  { color: "bg-emerald-700",    label: "Trekking (25%)" },
  { color: "bg-emerald-500",    label: "History (20%)" },
  { color: "bg-tertiary",       label: "Culinary (15%)" },
];

/* ─── icon helper ────────────────────────────────────────── */
function StatIcon({ type }: { type: string }) {
  const cls = "h-4 w-4";
  if (type === "users")   return <Users    className={cls} />;
  if (type === "compass") return <Compass  className={cls} />;
  if (type === "apps")    return <FileText className={cls} />;
  if (type === "exp")     return <FileText className={cls} />;
  return <TrendingUp className={cls} />;
}

/* ─── page ──────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [search, setSearch] = useState("");

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
            {stats.map((s) => (
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

          {/* ── Charts row ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Registration growth */}
            <div className="lg:col-span-2 bg-white dark:bg-[#2d3133] p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-headline font-extrabold text-base text-primary">User Registration Growth</h3>
                  <p className="text-xs text-on-surface-variant">Daily registrations over the last 30 days</p>
                </div>
                <select className="text-[11px] font-semibold bg-surface-container-low border-none rounded-lg px-2 py-1.5 focus:outline-none">
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
              </div>

              {/* Bar chart */}
              <div className="h-48 flex items-end gap-0.5">
                {chartBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 relative group"
                    style={{ height: `${h}%` }}
                  >
                    <div
                      className="absolute inset-0 bg-primary/8 rounded-t-sm"
                    />
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                    {i === 10 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-white text-[10px] rounded-lg whitespace-nowrap shadow">
                        42 New
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">
                <span>Oct 01</span>
                <span>Oct 10</span>
                <span>Oct 20</span>
                <span>Oct 30</span>
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="bg-white dark:bg-[#2d3133] p-6 rounded-3xl shadow-sm">
              <h3 className="font-headline font-extrabold text-base text-primary mb-0.5">Marketplace Revenue</h3>
              <p className="text-xs text-on-surface-variant mb-6">Volume in ETB (Thousands)</p>
              <div className="space-y-5">
                {revenueRows.map((r) => (
                  <div key={r.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface-variant">{r.label}</span>
                      <span className="text-primary">{r.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.shade}`}
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-outline-variant/10 flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant">Total Volume</span>
                <span className="font-headline font-extrabold text-lg text-primary">
                  320.8k <span className="text-xs font-normal">ETB</span>
                </span>
              </div>
            </div>
          </section>

          {/* ── Bottom row ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left: table + approvals */}
            <div className="lg:col-span-2 space-y-5">

              {/* Pending applications table */}
              <div className="bg-white dark:bg-[#2d3133] rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <h3 className="font-headline font-extrabold text-base text-primary">Pending Host Applications</h3>
                  <button className="text-[11px] font-bold text-primary hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left min-w-[460px]">
                    <thead className="bg-surface-container-low/50">
                      <tr>
                        {["Applicant Name", "Experience Type", "Date Submitted", "Action"].map((h, i) => (
                          <th
                            key={h}
                            className={`px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ${i === 3 ? "text-right" : ""}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {pendingApps.map((app) => (
                        <tr key={app.name} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${app.color}`}>
                                {app.initials}
                              </div>
                              <span className="text-sm font-headline font-semibold text-primary">{app.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-on-surface-variant">{app.type}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-on-surface-variant">{app.date}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full hover:opacity-90 transition-opacity">
                              View Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent approvals */}
              <div className="bg-white dark:bg-[#2d3133] p-5 rounded-3xl shadow-sm">
                <h3 className="text-sm font-headline font-bold text-primary mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Recent Experience Approvals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentApprovals.map((a) => (
                    <div key={a.title} className="p-3.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-headline font-bold text-primary">{a.title}</p>
                        <p className="text-[10px] text-on-surface-variant">Approved by {a.by}</p>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[9px] font-bold rounded uppercase tracking-wide">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: marketplace health */}
            <div className="bg-white dark:bg-[#2d3133] p-6 rounded-3xl shadow-sm flex flex-col">
              <h3 className="font-headline font-extrabold text-base text-primary mb-0.5">Marketplace Health</h3>
              <p className="text-xs text-on-surface-variant mb-6">Category Distribution</p>

              {/* Donut visual */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: "conic-gradient(#003527 0% 40%, #047857 40% 65%, #10b981 65% 85%, #78350f 85% 100%)",
                    padding: "16px",
                  }}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#2d3133] flex flex-col items-center justify-center">
                    <span className="font-headline font-black text-2xl text-primary">85</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Total Active</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {donutSegments.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
                    <span className="text-[11px] text-on-surface">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Top regions */}
              <div className="mt-auto">
                <h4 className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                  Top Performing Regions
                </h4>
                <div className="space-y-2">
                  {regions.map((r) => (
                    <div key={r.name} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-headline font-bold text-primary/25">{r.rank}</span>
                        <span className="text-sm font-headline font-bold text-primary">{r.name}</span>
                      </div>
                      {r.trend === "up" ? (
                        <ArrowUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
