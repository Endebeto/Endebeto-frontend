import type { TooltipContentProps } from "recharts";
import { fmtEtbMajorUnits } from "./dashboardUtils";

export type ChartTooltipProps = TooltipContentProps;

export function BarTooltipBody({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs shadow-lg max-w-[220px]">
      {label != null && label !== "" ? (
        <p className="font-headline font-bold text-primary mb-1.5 border-b border-outline-variant/10 pb-1">
          {label}
        </p>
      ) : null}
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

export function AreaTooltipBody({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs shadow-lg max-w-[220px]">
      {label != null && label !== "" ? (
        <p className="font-headline font-bold text-primary mb-1.5 border-b border-outline-variant/10 pb-1">
          {label}
        </p>
      ) : null}
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

export function PieTooltipBody({ active, payload }: ChartTooltipProps) {
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
