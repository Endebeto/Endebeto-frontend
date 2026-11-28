import { useId } from "react";
import { ShieldCheck } from "lucide-react";
import {
  CANCELLATION_POLICY_OPTIONS,
  normalisePolicy,
  type CancellationPolicy,
} from "@/lib/cancellationPolicy";

/**
 * Refund design: host picks the free-cancellation window for a listing.
 * Changes apply to new bookings only — existing bookings keep their policy.
 */
export function CancellationPolicyField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (next: CancellationPolicy) => void;
}) {
  const id = useId();
  const current = normalisePolicy(value);
  const hint = CANCELLATION_POLICY_OPTIONS.find((o) => o.value === current)?.hint;

  return (
    <div id="field-cancellationPolicy">
      <label htmlFor={id} className="block text-sm font-bold text-on-surface dark:text-white mb-2">
        Cancellation policy
      </label>
      <select
        id={id}
        value={current}
        onChange={(e) => onChange(normalisePolicy(e.target.value))}
        className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        {CANCELLATION_POLICY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400 flex items-start gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
        <span>
          {hint}. Guests who cancel in time get their payment back minus the payment processing
          fee. Changes apply to new bookings only.
        </span>
      </p>
    </div>
  );
}
