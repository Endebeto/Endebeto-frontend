import { Loader2, BarChart3, CircleDollarSign } from "lucide-react";
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
import type { PlatformStats } from "@/services/admin.service";
import {
  BarTooltipBody,
  AreaTooltipBody,
  PieTooltipBody,
} from "./DashboardChartTooltips";
import { formatEtbAxisTick } from "./dashboardUtils";

type ExpMixSlice = { name: string; value: number; color: string };

export function DashboardChartsGrid({
  months,
  revenueSeries,
  setRevenueSeries,
  chartsLoading,
  isLoading,
  statsData,
  revenueRows,
  activityRows,
  revenueAreaYMax,
  expMix,
  expMixTotal,
}: {
  months: number;
  revenueSeries: "revenue" | "fees";
  setRevenueSeries: (s: "revenue" | "fees") => void;
  chartsLoading: boolean;
  isLoading: boolean;
  statsData: PlatformStats | undefined;
  revenueRows: { month: string; revenue: number; fees: number }[];
  activityRows: { month: string; signups: number; bookings: number }[];
  revenueAreaYMax: number;
  expMix: ExpMixSlice[];
  expMixTotal: number;
}) {
  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                Monthly{" "}
                {revenueSeries === "revenue"
                  ? "gross revenue (host + platform fee)"
                  : "platform fees"}{" "}
                from wallet ledger entries, by payment month, over the last{" "}
                {months} months. Matches the same source and dates as the other
                line. ETB.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-0.5">
              {(
                [
                  { id: "revenue" as const, label: "Revenue" },
                  { id: "fees" as const, label: "Fees" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
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
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#005234" stopOpacity={0.5} />
                      <stop
                        offset="100%"
                        stopColor="#005234"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b45309" stopOpacity={0.5} />
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
                    name={revenueSeries === "revenue" ? "Revenue" : "Fees"}
                    stroke={
                      revenueSeries === "revenue" ? "#005234" : "#b45309"
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

        <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 p-4 md:p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="font-headline font-extrabold text-sm text-primary">
              Experience listings
            </h2>
            <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
              Catalog composition — live (scheduled), pending, expired (past or
              unset date), suspended, and drafts.
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
                      formatter={(v: number) => (v > 0 ? String(v) : "")}
                    />
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value, entry) => {
                      const v = (entry as { payload?: { value?: number } })
                        .payload?.value;
                      return `${value} (${v ?? 0})`;
                    }}
                    wrapperStyle={{ fontSize: "11px", paddingTop: 6 }}
                  />
                  <Tooltip
                    content={(props) => <PieTooltipBody {...props} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

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
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Tooltip content={(props) => <BarTooltipBody {...props} />} />
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
    </>
  );
}
