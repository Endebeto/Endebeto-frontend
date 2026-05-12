import { Wallet, Clock, AlertCircle } from "lucide-react";

export function PayoutSummaryCards({
  isLoading,
  paidTotal,
  pendingCount,
  pendingAmount,
  failedCount,
}: {
  isLoading: boolean;
  paidTotal: string;
  pendingCount: number;
  pendingAmount: string;
  failedCount: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm min-w-0 group">
        <div
          className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500"
          style={{ background: "rgba(0,82,52,0.12)" }}
        />
        <div
          className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500"
          style={{ background: "rgba(0,82,52,0.07)" }}
        />
        <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
          <Wallet className="h-4 w-4 text-primary/60" /> Total Paid Out
        </p>
        <p className="font-headline font-extrabold text-2xl text-primary tracking-tight">
          {isLoading ? "–" : paidTotal}{" "}
          <span className="text-base font-semibold text-primary/60">ETB</span>
        </p>
        <p className="text-[10px] text-on-surface-variant/70 mt-1">
          All-time lifetime distribution
        </p>
      </div>

      <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm min-w-0 group border-b-4 border-amber-300/60">
        <div
          className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500"
          style={{ background: "rgba(255,179,71,0.22)" }}
        />
        <div
          className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500"
          style={{ background: "rgba(255,179,71,0.14)" }}
        />
        <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
          <Clock className="h-4 w-4 text-on-tertiary-container" /> Pending
          Transfers
        </p>
        <div className="flex items-baseline gap-2">
          <p className="font-headline font-extrabold text-2xl text-primary tracking-tight">
            {isLoading ? "–" : pendingCount}
          </p>
          <span className="text-xs text-on-surface-variant font-medium">
            / {isLoading ? "–" : pendingAmount} ETB
          </span>
        </div>
        <p className="text-[10px] text-on-surface-variant/70 mt-1">
          Awaiting administrative approval
        </p>
      </div>

      <div className="relative bg-white dark:bg-[#2d3133] p-6 rounded-2xl shadow-sm min-w-0 group">
        <div
          className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500"
          style={{ background: "rgba(186,26,26,0.12)" }}
        />
        <div
          className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500"
          style={{ background: "rgba(186,26,26,0.07)" }}
        />
        <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 mb-4">
          <AlertCircle className="h-4 w-4 text-error" /> Failed Payouts
        </p>
        <p className="font-headline font-extrabold text-2xl text-error tracking-tight">
          {isLoading ? "–" : failedCount}
        </p>
        <p className="text-[10px] text-on-surface-variant/70 mt-1">
          Requires manual intervention
        </p>
      </div>
    </div>
  );
}
