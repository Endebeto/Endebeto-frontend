import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Coins,
  XCircle,
  ChevronRight,
} from "lucide-react";
import type { AdminBookingsSummary } from "@/services/admin.service";
import type { AdminBookingStatusFilter } from "@/hooks/useAdminBookings";
import { fmtCurrency } from "./adminBookingsUtils";

interface AdminBookingsHeaderProps {
  summary: AdminBookingsSummary;
  isLoading: boolean;
  activeStatus?: AdminBookingStatusFilter;
  onStatusChange?: (status: AdminBookingStatusFilter) => void;
}

export function AdminBookingsHeader({
  summary,
  isLoading,
  activeStatus = "all",
  onStatusChange,
}: AdminBookingsHeaderProps) {
  const cards: {
    statusKey?: AdminBookingStatusFilter;
    label: string;
    value: string;
    subtext: string;
    icon: typeof CalendarCheck;
    iconColor: string;
    bgLight: string;
  }[] = [
    {
      statusKey: "all",
      label: "Total Bookings",
      value: isLoading ? "—" : (summary.totalBookings ?? 0).toLocaleString(),
      subtext: "Platform lifetime",
      icon: CalendarCheck,
      iconColor: "text-primary",
      bgLight: "bg-primary/5",
    },
    {
      label: "Gross Bookings Volume",
      value: isLoading ? "—" : fmtCurrency(summary.totalRevenue ?? 0),
      subtext: "Paid reservations",
      icon: Coins,
      iconColor: "text-emerald-600",
      bgLight: "bg-emerald-500/10",
    },
    {
      statusKey: "upcoming",
      label: "Upcoming",
      value: isLoading ? "—" : (summary.upcoming ?? 0).toLocaleString(),
      subtext: "Scheduled sessions",
      icon: Clock,
      iconColor: "text-blue-600",
      bgLight: "bg-blue-500/10",
    },
    {
      statusKey: "completed",
      label: "Completed",
      value: isLoading ? "—" : (summary.completed ?? 0).toLocaleString(),
      subtext: "Successfully finished",
      icon: CheckCircle2,
      iconColor: "text-teal-600",
      bgLight: "bg-teal-500/10",
    },
    {
      statusKey: "cancelled",
      label: "Cancelled / Expired",
      value: isLoading
        ? "—"
        : (
            (summary.cancelled ?? 0) + (summary.paymentExpired ?? 0)
          ).toLocaleString(),
      subtext: `${summary.cancelled ?? 0} cancelled, ${summary.paymentExpired ?? 0} expired`,
      icon: XCircle,
      iconColor: "text-red-500",
      bgLight: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mb-1.5">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-primary">
              Bookings Management
            </span>
          </nav>
          <h2 className="font-headline font-extrabold text-3xl text-primary tracking-tight">
            Platform Bookings
          </h2>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Search, filter, and review bookings and customer reservations across
            all experiences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cards.map((c) => {
          const Icon = c.icon;
          const isClickable = Boolean(c.statusKey && onStatusChange);
          const isActive = c.statusKey && activeStatus === c.statusKey;

          const cardContent = (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-on-surface-variant">
                  {c.label}
                </span>
                <div className={`p-2 rounded-xl ${c.bgLight}`}>
                  <Icon className={`h-4 w-4 ${c.iconColor}`} />
                </div>
              </div>
              <div className="text-left">
                <p className="font-headline font-black text-2xl text-primary tracking-tight">
                  {c.value}
                </p>
                <p className="text-[11px] text-on-surface-variant/80 mt-0.5 truncate">
                  {c.subtext}
                </p>
              </div>
            </>
          );

          if (isClickable) {
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => onStatusChange?.(c.statusKey!)}
                className={`bg-white dark:bg-[#2d3133] p-4 rounded-2xl border shadow-sm flex flex-col justify-between text-left transition-all cursor-pointer hover:shadow-md hover:border-primary/40 ${
                  isActive
                    ? "ring-2 ring-primary border-primary bg-primary/[0.02]"
                    : "border-outline-variant/10"
                }`}
                title={`Filter by ${c.label}`}
              >
                {cardContent}
              </button>
            );
          }

          return (
            <div
              key={c.label}
              className="bg-white dark:bg-[#2d3133] p-4 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col justify-between"
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
