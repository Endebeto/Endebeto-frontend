import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";
import type { AdminPlatformBooking } from "@/services/admin.service";
import {
  BOOKING_STATUS_CONFIG,
  fmtCurrency,
  formatBookingDate,
} from "./adminBookingsUtils";

interface AdminBookingDrawerProps {
  booking: AdminPlatformBooking;
  onClose: () => void;
  onRequestCancel: (booking: AdminPlatformBooking) => void;
}

export function AdminBookingDrawer({
  booking,
  onClose,
  onRequestCancel,
}: AdminBookingDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const statusConf = BOOKING_STATUS_CONFIG[booking.status] || {
    label: booking.status,
    className: "bg-surface-container text-on-surface",
  };

  const canCancel =
    booking.status !== "cancelled" &&
    booking.status !== "completed" &&
    booking.status !== "paymentExpired";

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex pointer-events-auto">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-xs border-0 cursor-default"
        aria-label="Close booking details"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="w-full max-w-lg h-full ml-auto relative bg-white dark:bg-[#2d3133] shadow-2xl flex flex-col overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10 sticky top-0 bg-white/95 dark:bg-[#2d3133]/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Booking Overview
            </span>
            <h3 className="font-headline font-extrabold text-lg text-primary truncate max-w-[320px]">
              {booking.txRef || booking._id}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Status & Payment Banner */}
          <div className="bg-surface-container-low dark:bg-zinc-800/60 p-4 rounded-2xl border border-outline-variant/10 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
                Reservation Status
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusConf.className}`}
                >
                  {statusConf.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                    booking.paid
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  {booking.paid ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {booking.paid ? "Paid" : "Pending Payment"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
                Amount
              </p>
              <p className="font-headline font-extrabold text-xl text-primary mt-0.5">
                {fmtCurrency(booking.price)}
              </p>
              <p className="text-[10px] text-on-surface-variant">
                {booking.quantity} {booking.quantity === 1 ? "guest" : "guests"}
              </p>
            </div>
          </div>

          {/* Experience Card */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Experience Details
            </h4>
            <div className="bg-white dark:bg-zinc-800/40 border border-outline-variant/10 rounded-2xl p-4 flex gap-3.5">
              {booking.experience?.imageCover ? (
                <img
                  src={booking.experience.imageCover}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-surface-container"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant flex-shrink-0">
                  EXP
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-primary leading-snug line-clamp-2">
                  {booking.experience?.title || "Untitled Experience"}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">
                    {booking.experience?.location || "Ethiopia"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>
                    {formatBookingDate(
                      booking.experienceDate || booking.createdAt,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {booking.experience && (
              <div className="flex items-center justify-end gap-3 mt-1">
                <Link
                  to={`/admin/experiences?search=${encodeURIComponent(booking.experience.title || "")}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  title="Inspect experience in Admin Catalog"
                >
                  Inspect in Experiences
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <span className="text-outline-variant">•</span>
                <Link
                  to={`/experiences/${booking.experience.slug || booking.experience._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary hover:underline"
                >
                  View Public Listing
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Guest Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Guest Information
              </h4>
              {booking.user?.email && (
                <Link
                  to={`/admin/users?search=${encodeURIComponent(booking.user.email)}`}
                  className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Inspect in Users
                  <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              )}
            </div>
            <div className="bg-white dark:bg-zinc-800/40 border border-outline-variant/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={booking.user?.name || "Guest"}
                  photo={booking.user?.photo}
                  className="w-10 h-10 rounded-xl"
                  initialsClassName="text-sm font-bold"
                />
                <div>
                  <p className="font-bold text-sm text-primary">
                    {booking.user?.name || "Guest User"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {booking.user?.email || "—"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {booking.user?.email && (
                  <a
                    href={`mailto:${booking.user.email}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-medium transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">Email Guest</span>
                  </a>
                )}
                {booking.user?.phone ? (
                  <a
                    href={`tel:${booking.user.phone}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-medium transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{booking.user.phone}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low text-on-surface-variant/60 font-medium">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">No phone listed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Host Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Host Information
              </h4>
              <div className="flex items-center gap-2">
                {booking.experience?.host?.email && (
                  <>
                    <Link
                      to={`/admin/users?search=${encodeURIComponent(booking.experience.host.email)}`}
                      className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Inspect in Users
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                    <span className="text-outline-variant">•</span>
                    <Link
                      to={`/admin/payouts?search=${encodeURIComponent(booking.experience.host.email)}`}
                      className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Payouts
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-800/40 border border-outline-variant/10 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={booking.experience?.host?.name || "Host"}
                  photo={booking.experience?.host?.photo}
                  className="w-10 h-10 rounded-xl"
                  initialsClassName="text-sm font-bold"
                />
                <div>
                  <p className="font-bold text-sm text-primary">
                    {booking.experience?.host?.name || "Host"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {booking.experience?.host?.email || "—"}
                  </p>
                </div>
              </div>
              {booking.experience?.host?.email && (
                <a
                  href={`mailto:${booking.experience.host.email}`}
                  className="p-2 rounded-xl hover:bg-surface-container text-primary"
                  title="Email host"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Transaction Metadata
            </h4>
            <div className="bg-surface-container-low dark:bg-zinc-800/40 rounded-2xl p-4 divide-y divide-outline-variant/10 text-xs">
              <div className="flex items-center justify-between py-2 first:pt-0">
                <span className="text-on-surface-variant">Chapa Reference</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-primary">
                  <span>{booking.txRef || "—"}</span>
                  {booking.txRef && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(booking.txRef!, "txRef")}
                      className="p-1 rounded hover:bg-surface-container"
                    >
                      {copiedKey === "txRef" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-on-surface-variant">
                  Internal Booking ID
                </span>
                <div className="flex items-center gap-1.5 font-mono text-on-surface">
                  <span className="truncate max-w-[140px]">{booking._id}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(booking._id, "bookingId")}
                    className="p-1 rounded hover:bg-surface-container"
                  >
                    {copiedKey === "bookingId" ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-on-surface-variant">Created At</span>
                <span className="font-semibold text-on-surface">
                  {formatBookingDate(booking.createdAt)}
                </span>
              </div>

              {booking.completedAt && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">Completed At</span>
                  <span className="font-semibold text-on-surface">
                    {formatBookingDate(booking.completedAt)}
                  </span>
                </div>
              )}

              {booking.expiresAt && booking.status === "paymentExpired" && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">Expired At</span>
                  <span className="font-semibold text-amber-600">
                    {formatBookingDate(booking.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-outline-variant/10 bg-white dark:bg-[#2d3133] sticky bottom-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
          >
            Close
          </button>

          {canCancel && (
            <button
              type="button"
              onClick={() => onRequestCancel(booking)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-300 text-xs font-bold rounded-xl transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Booking
            </button>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
