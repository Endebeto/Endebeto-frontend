import { useQuery } from "@tanstack/react-query";
import {
  Printer,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { bookingsService, type TaxInvoice } from "@/services/bookings.service";
import { getFriendlyErrorMessage } from "@/lib/errors";

interface TaxInvoiceModalProps {
  bookingId: string | null;
  isOpen: boolean;
  onClose: () => void;
  viewerContext?: "guest" | "host";
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatCurrency(amount?: number, currency = "ETB"): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0.00 ETB";
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function TaxInvoiceModal({
  bookingId,
  isOpen,
  onClose,
  viewerContext,
}: TaxInvoiceModalProps) {
  const {
    data: invoiceData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["booking-invoice", bookingId, viewerContext],
    queryFn: async () => {
      if (!bookingId) throw new Error("No booking ID");
      const res = await bookingsService.getInvoice(bookingId, viewerContext);
      return res.data.data.invoice;
    },
    enabled: isOpen && Boolean(bookingId),
    staleTime: 1000 * 60 * 15,
  });

  const handlePrint = () => {
    window.print();
  };

  const isHostView =
    viewerContext === "host" ||
    invoiceData?.viewerRole === "host" ||
    invoiceData?.viewerRole === "admin";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-7 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xl">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <DialogTitle className="text-lg font-headline font-bold">
                {isHostView ? "Host Settlement & Tax Invoice" : "Tax Invoice & Official Receipt"}
              </DialogTitle>
            </div>
            {invoiceData && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Save PDF
                </Button>
              </div>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {isHostView
              ? "Official host settlement statement & tax breakdown in compliance with Ethiopian commercial standards."
              : "Official electronic receipt issued in compliance with Ethiopian revenue and commercial standards."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Generating tax invoice & calculating breakdown...
            </p>
          </div>
        )}

        {isError && (
          <div className="py-12 flex flex-col items-center text-center gap-3">
            <AlertCircle className="h-9 w-9 text-rose-500" />
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Could not load tax invoice
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {getFriendlyErrorMessage(error, "Invoice is only available for confirmed and paid bookings.")}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-2 text-xs">
              Try Again
            </Button>
          </div>
        )}

        {invoiceData && (
          <InvoiceDocument invoice={invoiceData} isHostView={isHostView} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDocument({
  invoice,
  isHostView,
}: {
  invoice: TaxInvoice;
  isHostView: boolean;
}) {

  const platformFeeRate = invoice.breakdown.platformFeeRate ?? 0.15;
  const platformFee =
    typeof invoice.breakdown.platformFee === "number"
      ? invoice.breakdown.platformFee
      : Math.round(invoice.grossTotal * platformFeeRate * 100) / 100;
  const netHostPayout =
    typeof invoice.breakdown.netHostPayout === "number"
      ? invoice.breakdown.netHostPayout
      : Math.round((invoice.grossTotal - platformFee) * 100) / 100;

  return (
    <div
      id="printable-tax-invoice"
      className="mt-2 text-zinc-900 dark:text-zinc-100 font-sans print:text-black print:bg-white"
    >
      {/* Header Banner */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-black tracking-tight text-primary font-headline">
              {invoice.issuer.tradeName}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> PAID
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {invoice.issuer.legalEntity}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {invoice.issuer.address}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            <span>TIN: <strong className="text-zinc-700 dark:text-zinc-300">{invoice.issuer.tin}</strong></span>
            <span>VAT Reg: <strong className="text-zinc-700 dark:text-zinc-300">{invoice.issuer.vatNumber}</strong></span>
          </div>
        </div>

        <div className="sm:text-right flex flex-col items-start sm:items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
            {isHostView ? "Host Settlement Statement" : "Official Fiscal Receipt"}
          </span>
          <p className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1.5">
            {invoice.invoiceNumber}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Issued: {formatDate(invoice.issueDate)}
          </p>
          {invoice.txRef && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
              Ref: {invoice.txRef}
            </p>
          )}
        </div>
      </div>

      {/* Parties Involved Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl mb-5 border border-zinc-200/70 dark:border-zinc-800 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
            <User className="h-3 w-3" /> Billed To (Guest)
          </p>
          <p className="font-bold text-zinc-900 dark:text-zinc-100">
            {invoice.guest.name}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">{invoice.guest.email}</p>
          {invoice.guest.phone && (
            <p className="text-zinc-500 dark:text-zinc-400">{invoice.guest.phone}</p>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
            <Building2 className="h-3 w-3" /> Experience Host
          </p>
          <p className="font-bold text-zinc-900 dark:text-zinc-100">
            {invoice.host.name}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">{invoice.host.email}</p>
          {invoice.host.tinNumber && (
            <p className="text-zinc-500 dark:text-zinc-400">TIN: {invoice.host.tinNumber}</p>
          )}
        </div>
      </div>

      {/* Experience Line Items Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-5">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="p-3">Description & Service Details</th>
              <th className="p-3 text-center">Session Date</th>
              <th className="p-3 text-center">Guests</th>
              <th className="p-3 text-right">Price / Guest</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <tr>
              <td className="p-3 font-medium">
                <p className="text-zinc-900 dark:text-zinc-100 font-bold">
                  {invoice.experience.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {invoice.experience.location}
                  {invoice.experience.duration ? ` • ${invoice.experience.duration}` : ""}
                </p>
              </td>
              <td className="p-3 text-center text-zinc-600 dark:text-zinc-400">
                {formatDate(invoice.experienceDate)}
              </td>
              <td className="p-3 text-center font-semibold text-zinc-800 dark:text-zinc-200">
                {invoice.guestsCount}
              </td>
              <td className="p-3 text-right font-mono text-zinc-700 dark:text-zinc-300">
                {formatCurrency(invoice.pricePerGuest, invoice.currency)}
              </td>
              <td className="p-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(invoice.grossTotal, invoice.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tax & Payout Breakdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 mb-5">
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1 max-w-sm">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">
            {isHostView ? "Host Settlement & Tax Disclosure" : "Payment & Tax Disclosure"}
          </p>
          <p>
            Payment handled securely via <strong>{invoice.paymentMethod}</strong> gateway.
          </p>
          {isHostView ? (
            <p>
              Platform intermediation fee covers booking infrastructure, security guarantee, and payment routing.
            </p>
          ) : (
            <p>
              This electronic receipt confirms your booking payment and inclusive tax for the cultural experience.
            </p>
          )}
        </div>

        <div className="w-full sm:w-72 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Gross Booking Total:</span>
            <span className="font-mono font-medium">{formatCurrency(invoice.grossTotal, invoice.currency)}</span>
          </div>

          {isHostView && (
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Platform Service Fee ({(platformFeeRate * 100).toFixed(0)}%):</span>
              <span className="font-mono font-medium">-{formatCurrency(platformFee, invoice.currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 pt-1.5">
            <span>Applicable {invoice.breakdown.taxType} ({((invoice.breakdown.taxRate ?? 0.02) * 100).toFixed(0)}%{!isHostView ? " Included" : ""}):</span>
            <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
              {formatCurrency(invoice.breakdown.taxAmount, invoice.currency)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 border-t-2 border-zinc-300 dark:border-zinc-700 pt-2">
            <span>Total Paid by Guest:</span>
            <span className="font-mono text-primary font-black">
              {formatCurrency(invoice.grossTotal, invoice.currency)}
            </span>
          </div>

          {isHostView && (
            <div className="flex justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200 pt-1 bg-amber-500/10 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
              <div>
                <span>Net Host Wallet Credit:</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Credited directly to Host Wallet</p>
              </div>
              <span className="font-mono text-amber-900 dark:text-amber-200 font-bold self-center">
                {formatCurrency(netHostPayout, invoice.currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Official Footnote / Legal Stamp */}
      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center border-t border-zinc-200/60 dark:border-zinc-800/80 pt-3">
        <p>
          This electronic fiscal document is issued pursuant to Ethiopian commercial and revenue proclamations.
        </p>
        <p className="mt-0.5">
          For inquiries or tax certification, contact {invoice.issuer.supportEmail} or call {invoice.issuer.supportPhone}.
        </p>
      </div>
    </div>
  );
}
