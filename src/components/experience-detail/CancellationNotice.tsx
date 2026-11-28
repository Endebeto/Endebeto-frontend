import { CalendarX, ShieldCheck } from "lucide-react";
import { cutoffLabel, freeCancelUntil } from "@/lib/cancellationPolicy";

/**
 * Refund design: shown next to the pay button so guests know the rule before
 * paying. Uses the selected session's start (falls back to the next date).
 */
export function CancellationNotice({
  policy,
  sessionStart,
}: {
  policy: string | undefined;
  sessionStart: string | Date | null | undefined;
}) {
  const cutoff = freeCancelUntil(policy, sessionStart);
  const label = cutoffLabel(cutoff);
  const free = label.startsWith("Free");
  const Icon = free ? ShieldCheck : CalendarX;

  return (
    <div
      className={`mb-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${
        free
          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
          : "bg-surface-container-low text-on-surface-variant dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <p>
        <span className="font-bold">{label}.</span>{" "}
        {free
          ? "Cancel before then for a refund minus the payment processing fee."
          : "If you cancel, your payment isn't refunded."}
      </p>
    </div>
  );
}
