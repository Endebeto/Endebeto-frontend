import type { CompareWindow } from "@/services/admin.service";

export function DashboardHeaderBar({
  compare,
  setCompare,
  months,
  setMonths,
}: {
  compare: CompareWindow;
  setCompare: (c: CompareWindow) => void;
  months: 3 | 6 | 12 | 24;
  setMonths: (m: 3 | 6 | 12 | 24) => void;
}) {
  return (
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
              { id: "rolling30" as const, label: "Rolling 30d" },
              { id: "month" as const, label: "This month" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
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
            setMonths(Number(e.target.value) as 3 | 6 | 12 | 24)
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
  );
}
