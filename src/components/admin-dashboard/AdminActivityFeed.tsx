import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Ban,
  CheckCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import { adminService, type AdminAuditLog } from "@/services/admin.service";
import { UserAvatar } from "@/components/UserAvatar";

interface ActionConfig {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}

const ACTION_MAP: Record<string, ActionConfig> = {
  "user.suspend": {
    label: "Suspended User",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900/50",
    icon: UserX,
    iconClass: "text-red-600 dark:text-red-400",
  },
  "user.reinstate": {
    label: "Reinstated User",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    icon: UserCheck,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  "user.suspend_host_listings": {
    label: "Hold Listings",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    icon: ShieldAlert,
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  "user.reinstate_host_listings": {
    label: "Restore Listings",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    icon: ShieldCheck,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  "host_application.approve": {
    label: "Approved Host",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  "host_application.reject": {
    label: "Rejected Host",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    icon: XCircle,
    iconClass: "text-rose-600 dark:text-rose-400",
  },
  "payout.create_export": {
    label: "Exported CSV",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    icon: FileSpreadsheet,
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  "payout.mark_paid": {
    label: "Disbursed Payout",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    icon: CheckCheck,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  "payout.mark_failed": {
    label: "Failed Payout",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    icon: AlertCircle,
    iconClass: "text-rose-600 dark:text-rose-400",
  },
  "payout.reveal_account": {
    label: "Account Revealed",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: Eye,
    iconClass: "text-slate-600 dark:text-slate-400",
  },
  "experience.suspend": {
    label: "Suspended Listing",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    icon: PauseCircle,
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  "experience.reinstate": {
    label: "Reinstated Listing",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    icon: PlayCircle,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  "booking.cancel": {
    label: "Cancelled Booking",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900/50",
    icon: Ban,
    iconClass: "text-red-600 dark:text-red-400",
  },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return "Just now";
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getTargetLink(targetType: string, targetLabel?: string, targetId?: string): string | null {
  const query = targetLabel || targetId;
  if (!query) return null;
  const encoded = encodeURIComponent(query);
  switch (targetType) {
    case "User":
      return `/admin/users?search=${encoded}`;
    case "Experience":
      return `/admin/experiences?search=${encoded}`;
    case "HostApplication":
      return `/admin/host-applications?search=${encoded}`;
    case "WithdrawalRequest":
      return `/admin/payouts?search=${encoded}`;
    case "Booking":
      return `/admin/bookings?search=${encoded}`;
    default:
      return null;
  }
}

export function AdminActivityFeed() {
  const {
    data: activities = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: adminQueryKeys.activityFeed(),
    queryFn: async () => {
      const res = await adminService.getActivityFeed(25);
      return res.data?.data || [];
    },
    refetchInterval: 12_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });

  return (
    <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-outline-variant/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-extrabold text-base text-primary">
                Live Audit &amp; Activity Feed
              </h3>
              {/* Option 1: Live heartbeat status indicator */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Live (12s sync)
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Real-time log of administrative and operational actions across the platform
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Manual refresh"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-primary bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : "text-on-surface-variant"}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Feed Content */}
      <div className="divide-y divide-outline-variant/10 max-h-[480px] overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface-container-high" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-surface-container-high rounded w-3/4" />
                  <div className="h-2.5 bg-surface-container rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant mb-3">
              <Activity className="h-6 w-6 opacity-40" />
            </div>
            <p className="text-sm font-bold text-primary">No administrative activity recorded yet</p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              Actions taken by platform admins (suspensions, reviews, payout exports, and approvals) will stream here in real time.
            </p>
          </div>
        ) : (
          activities.map((item: AdminAuditLog) => {
            const config = ACTION_MAP[item.action] ?? {
              label: item.action,
              badgeClass: "bg-surface-container text-on-surface-variant border-outline-variant/20",
              icon: Activity,
              iconClass: "text-on-surface-variant",
            };
            const ActionIcon = config.icon;
            const targetDisplay =
              item.targetLabel || (item.targetId != null ? String(item.targetId) : "");
            const targetLink = getTargetLink(item.targetType, targetDisplay, item.targetId);

            return (
              <div
                key={item._id}
                className="p-4 hover:bg-surface-container-low/50 transition-colors flex items-start gap-3 group"
              >
                {/* Admin Avatar */}
                <div className="relative flex-shrink-0">
                  <UserAvatar
                    name={item.admin?.name || "Admin"}
                    photo={item.admin?.photo}
                    className="w-9 h-9 rounded-xl bg-surface-container-high text-xs font-bold"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#2d3133] rounded-full p-0.5 shadow-sm">
                    <ActionIcon className={`h-3 w-3 ${config.iconClass}`} />
                  </div>
                </div>

                {/* Event Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-primary">
                      {item.admin?.name || "Platform Admin"}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>

                    {targetDisplay && (
                      <span className="text-on-surface-variant">on</span>
                    )}

                    {targetLink ? (
                      <Link
                        to={targetLink}
                        className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5 truncate max-w-[200px] sm:max-w-xs group-hover:text-primary"
                        title={targetDisplay}
                      >
                        <span className="truncate">{targetDisplay}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>
                    ) : targetDisplay ? (
                      <span className="font-semibold text-primary truncate max-w-[200px] sm:max-w-xs">
                        {targetDisplay}
                      </span>
                    ) : null}
                  </div>

                  {/* Context / Reason Preview */}
                  {item.details && typeof item.details === "object" && (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {typeof item.details.reason === "string" && item.details.reason && (
                        <p className="text-[11px] text-on-surface-variant italic bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/10">
                          &ldquo;{item.details.reason}&rdquo;
                        </p>
                      )}
                      {typeof item.details.count === "number" && (
                        <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                          {item.details.count} records
                        </span>
                      )}
                      {typeof item.details.price === "number" && (
                        <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                          {item.details.price} ETB
                        </span>
                      )}
                    </div>
                  )}

                  {/* Timestamp & Meta */}
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-on-surface-variant">
                    <span
                      className="inline-flex items-center gap-1"
                      title={new Date(item.createdAt).toLocaleString()}
                    >
                      <Clock className="h-2.5 w-2.5" />
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    <span>&bull;</span>
                    <span className="uppercase tracking-wider font-semibold text-[9px]">
                      {item.targetType}
                    </span>
                    {item.ipAddress && (
                      <>
                        <span>&bull;</span>
                        <span className="font-mono text-[9px] opacity-75">
                          {item.ipAddress}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
