import { Lightbulb } from "lucide-react";

export function PayoutFooterCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
      <div className="bg-surface-container-low/60 p-5 rounded-2xl border border-outline-variant/10">
        <h4 className="font-headline font-bold text-sm text-primary flex items-center gap-1.5 mb-2">
          <Lightbulb className="h-4 w-4 text-on-tertiary-container" /> Admin Tip
        </h4>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Payouts marked as "Paid" are final and deduct from the host's pending
          balance. "Failed" payouts return the amount to the host's available
          balance automatically. Always verify bank details before marking paid.
        </p>
      </div>
      <div className="bg-primary-container p-5 rounded-2xl flex items-center justify-between gap-4 shadow-md">
        <div>
          <h4 className="font-headline font-bold text-sm text-white">
            Need assistance?
          </h4>
          <p className="text-xs text-white/75 mt-0.5">
            Contact the financial operations team for complex bank reconciliation.
          </p>
        </div>
        <button className="shrink-0 bg-tertiary-fixed text-on-tertiary-fixed px-4 py-2 rounded-xl font-headline font-bold text-xs hover:opacity-90 transition-opacity whitespace-nowrap">
          Support Portal
        </button>
      </div>
    </div>
  );
}
