import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type DeltaBadgeProps = {
  curr: number;
  prev: number;
  /** "up is good" for revenue/signups, "down is good" for suspensions/refunds. */
  invertColor?: boolean;
  /** Optional trailing label, e.g. "vs last 30d". */
  suffix?: string;
  className?: string;
};

/** Formats period-over-period deltas. Renders "New" when prev=0 and curr>0,
 *  "—" when both are zero, and a signed pct change otherwise. */
export function DeltaBadge({
  curr,
  prev,
  invertColor = false,
  suffix,
  className = "",
}: DeltaBadgeProps) {
  if (!Number.isFinite(curr) || !Number.isFinite(prev)) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant ${className}`}
      >
        <Minus className="h-3 w-3" /> —{suffix ? ` ${suffix}` : ""}
      </span>
    );
  }

  if (prev === 0 && curr === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant ${className}`}
      >
        <Minus className="h-3 w-3" /> No change{suffix ? ` ${suffix}` : ""}
      </span>
    );
  }

  if (prev === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 ${className}`}
      >
        <ArrowUpRight className="h-3 w-3" /> New{suffix ? ` ${suffix}` : ""}
      </span>
    );
  }

  const pct = ((curr - prev) / Math.abs(prev)) * 100;
  const rounded = Math.abs(pct) >= 10 ? Math.round(pct) : Number(pct.toFixed(1));
  const isUp = pct > 0;
  const isFlat = Math.abs(pct) < 0.05;

  const goodUp = !invertColor;
  const isGood = isFlat ? true : isUp === goodUp;

  const colour = isFlat
    ? "text-on-surface-variant"
    : isGood
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold ${colour} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {isUp ? "+" : ""}
      {rounded}%{suffix ? ` ${suffix}` : ""}
    </span>
  );
}
