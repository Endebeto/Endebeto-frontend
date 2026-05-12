import { useQuery } from "@tanstack/react-query";
import { Award, Loader2 } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { UserAvatar } from "@/components/UserAvatar";
import { adminService, type TopHost } from "@/services/admin.service";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import { fmtEtb, fmtNum } from "./dashboardUtils";

export function TopHostsCard() {
  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.topHosts(),
    queryFn: () =>
      adminService
        .getTopHosts({ limit: 5 })
        .then((r) => (Array.isArray(r.data.data) ? r.data.data : [])),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const rows: TopHost[] = data ?? [];

  return (
    <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-outline-variant/10 flex items-center gap-2">
        <Award className="h-4 w-4 text-emerald-600" />
        <h3 className="font-headline font-extrabold text-sm text-primary">
          Top Hosts by Revenue
        </h3>
      </div>

      <div className="divide-y divide-outline-variant/10">
        {isLoading && !rows.length ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary/70" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-8">
            No hosts with paid bookings yet.
          </p>
        ) : (
          rows.map((row, i) => (
            <RouterLink
              key={row._id}
              to="/admin/users"
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors"
            >
              <span className="w-5 text-center text-xs font-bold text-on-surface-variant tabular-nums">
                {i + 1}
              </span>
              <UserAvatar
                name={row.name}
                photo={row.photo}
                className="w-10 h-10 rounded-full bg-primary/10"
                initialsClassName="text-primary text-xs"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">
                  {row.name ?? "Unknown"}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {row.experiencesCount} experience
                  {row.experiencesCount === 1 ? "" : "s"} ·{" "}
                  {fmtNum(row.bookings)} bookings
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-primary tabular-nums">
                  {fmtEtb(row.grossCents)} ETB
                </p>
                <p className="text-[10px] text-on-surface-variant">gross</p>
              </div>
            </RouterLink>
          ))
        )}
      </div>
    </div>
  );
}
