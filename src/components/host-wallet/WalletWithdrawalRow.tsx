import { Wallet } from "lucide-react";
import type { WithdrawalRequest } from "@/services/wallet.service";
import { etb, fmtDate, statusCfg } from "./walletFormatters";

export function WalletWithdrawalRow({ w }: { w: WithdrawalRequest }) {
  const cfg = statusCfg[w.status] ?? statusCfg.pending_transfer;
  const dest = w.destination;
  const displayAccNum = dest?.accountNumberLast4
    ? `****${dest.accountNumberLast4}`
    : dest?.accountNumber
      ? `****${String(dest.accountNumber).replace(/\s/g, "").slice(-4)}`
      : "****";
  const desc = dest
    ? `${dest.bankName ?? "Bank"} · ${dest.accountName ?? ""} ${displayAccNum}`
    : "Withdrawal";

  return (
    <tr className="hover:bg-surface-container-low/30 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="px-8 py-5 text-sm font-medium text-on-surface-variant dark:text-zinc-400 whitespace-nowrap">
        {fmtDate(w.createdAt)}
      </td>
      <td className="px-4 py-5 text-sm font-mono text-outline dark:text-zinc-500 whitespace-nowrap">
        #{w._id.slice(-8).toUpperCase()}
      </td>
      <td className="px-4 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ffddb8]/40 dark:bg-amber-900/30 flex items-center justify-center">
            <Wallet className="h-3.5 w-3.5 text-[#653e00] dark:text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-on-surface dark:text-white">
            Withdrawal
          </span>
        </div>
      </td>
      <td className="px-4 py-5 text-xs text-on-surface-variant dark:text-zinc-400 max-w-[200px] truncate">
        {desc}
      </td>
      <td className="px-4 py-5 text-sm font-bold text-error dark:text-red-400 whitespace-nowrap">
        −ETB {etb(w.amountCents)}
      </td>
      <td className="px-4 py-5 whitespace-nowrap">
        {w.status === "paid" && w.paymentReceiptUrl ? (
          <a
            href={w.paymentReceiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-green-400 hover:underline"
          >
            Receipt
          </a>
        ) : (
          <span className="text-[10px] text-on-surface-variant dark:text-zinc-500">
            —
          </span>
        )}
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.cls}`}
        >
          {cfg.label}
        </span>
      </td>
    </tr>
  );
}
