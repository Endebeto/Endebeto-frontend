import { CheckCircle2, Clock } from "lucide-react";
import type { EarningRow } from "@/services/wallet.service";
import { etb, fmtDate } from "./walletFormatters";

export function WalletEarningRow({ row }: { row: EarningRow }) {
  const isHeld = row.status === "held";

  return (
    <tr className="hover:bg-surface-container-low/30 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="px-8 py-5 text-sm text-on-surface-variant dark:text-zinc-400 whitespace-nowrap">
        {fmtDate(row.date)}
      </td>

      <td className="px-4 py-5 min-w-[220px] max-w-md">
        <div className="flex items-center gap-2.5 min-w-0">
          {row.booking?.experience?.imageCover ? (
            <img
              src={row.booking.experience.imageCover}
              alt={row.booking.experience.title}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-surface-container dark:bg-zinc-700 shrink-0" />
          )}
          <span className="text-xs font-semibold text-on-surface dark:text-white line-clamp-2">
            {row.booking?.experience?.title ?? "—"}
          </span>
        </div>
      </td>

      <td className="px-4 py-5 text-xs text-on-surface-variant dark:text-zinc-400 whitespace-nowrap">
        ETB {etb(row.grossCents)}
      </td>

      <td className="px-4 py-5 text-xs text-error dark:text-red-400 whitespace-nowrap">
        −ETB {etb(row.feeCents)}
      </td>

      <td className="px-4 py-5 text-sm font-bold text-primary dark:text-green-400 whitespace-nowrap">
        ETB {etb(row.netCents)}
      </td>

      <td className="px-8 py-5 whitespace-nowrap">
        {isHeld ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 uppercase">
            <Clock className="h-2.5 w-2.5" /> Held
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container dark:bg-emerald-900/40 text-on-secondary-fixed-variant dark:text-green-400 uppercase">
            <CheckCircle2 className="h-2.5 w-2.5" /> Released
          </span>
        )}
      </td>
    </tr>
  );
}
