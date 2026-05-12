import {
  Ban,
  CalendarClock,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fmtEtb } from "@/components/admin-experiences/experienceAdminUtils";
import type { AdminExperienceBookingStats } from "@/services/admin.service";

export function ExperienceBookingKpiStrip({
  stats,
  isLoading,
}: {
  stats: AdminExperienceBookingStats | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface dark:bg-zinc-800 rounded-xl p-3 border border-outline-variant/20 dark:border-zinc-700 h-16 animate-pulse"
          />
        ))}
      </div>
    );
  }
  const s = stats ?? {
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    expired: 0,
    totalGuestsServed: 0,
    upcomingGuests: 0,
    grossRevenue: 0,
    completedRevenue: 0,
  };
  const cells: {
    icon: LucideIcon;
    label: string;
    value: string;
    sub?: string;
  }[] = [
    {
      icon: CalendarClock,
      label: "Upcoming",
      value: String(s.upcoming),
      sub: `${s.upcomingGuests} guests`,
    },
    {
      icon: Star,
      label: "Completed",
      value: String(s.completed),
    },
    {
      icon: Ban,
      label: "Cancelled",
      value: String(s.cancelled),
    },
    {
      icon: Users,
      label: "Guests served",
      value: String(s.totalGuestsServed),
    },
    {
      icon: TrendingUp,
      label: "Gross revenue",
      value: fmtEtb(s.grossRevenue),
    },
  ];
  return (
    <div className="grid grid-cols-5 gap-2">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-surface dark:bg-zinc-800 rounded-xl p-3 border border-outline-variant/20 dark:border-zinc-700"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <c.icon className="h-3 w-3 text-primary dark:text-green-400" />
            <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 font-medium uppercase tracking-wide">
              {c.label}
            </p>
          </div>
          <p className="text-sm font-bold text-on-surface dark:text-white">
            {c.value}
          </p>
          {c.sub && (
            <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 mt-0.5">
              {c.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
