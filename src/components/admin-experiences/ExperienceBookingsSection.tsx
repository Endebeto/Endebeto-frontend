import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  BOOKING_FILTERS,
  BOOKING_STATUS_BADGE,
  fmtEtb,
  hostInitials,
} from "@/components/admin-experiences/experienceAdminUtils";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import {
  adminService,
  type AdminBooking,
  type AdminBookingStatus,
} from "@/services/admin.service";

export function ExperienceBookingsSection({ expId }: { expId: string }) {
  const [filter, setFilter] = useState<"all" | AdminBookingStatus>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.experienceBookings(expId, filter, page),
    queryFn: () =>
      adminService
        .getAdminExperienceBookings(expId, {
          status: filter === "all" ? undefined : filter,
          page,
          limit,
        })
        .then((r) => r.data),
    staleTime: 15_000,
  });

  const bookings: AdminBooking[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide">
          Bookings {total > 0 && `(${total})`}
        </p>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {BOOKING_FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                active
                  ? "bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-green-400/40 text-primary dark:text-green-400"
                  : "border-outline-variant/30 dark:border-zinc-600 text-on-surface-variant dark:text-zinc-400 hover:text-on-surface dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-xs text-red-500 py-6 justify-center">
          <AlertCircle className="h-4 w-4" /> Failed to load bookings.
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-8 text-xs text-on-surface-variant dark:text-zinc-400">
          No {filter === "all" ? "" : filter} bookings for this experience.
        </div>
      ) : (
        <div className="space-y-1.5">
          {bookings.map((b) => {
            const amount = b.price ?? 0;
            const dateStr = b.experienceDate
              ? new Date(b.experienceDate).toLocaleDateString()
              : "—";
            return (
              <div
                key={b._id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-outline-variant/15 dark:border-zinc-700 px-3 py-2 flex items-center gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {b.user?.photo ? (
                    <img
                      src={b.user.photo}
                      alt={b.user.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                      {hostInitials(b.user?.name ?? "??")}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface dark:text-white truncate">
                      {b.user?.name ?? "Deleted user"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 truncate">
                      {b.user?.email ?? ""}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-on-surface dark:text-zinc-200">{dateStr}</p>
                  <p className="text-[10px] text-on-surface-variant dark:text-zinc-400">
                    Qty {b.quantity ?? 1}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-on-surface dark:text-white">
                    {fmtEtb(amount)}
                  </p>
                  {b.txRef && (
                    <p
                      className="text-[10px] font-mono text-on-surface-variant dark:text-zinc-500 truncate max-w-[100px]"
                      title={b.txRef}
                    >
                      {b.txRef}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${BOOKING_STATUS_BADGE[b.status]}`}
                >
                  {b.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-on-surface-variant dark:text-zinc-400">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-outline-variant/30 dark:border-zinc-600 disabled:opacity-40 hover:bg-surface dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-3 w-3" /> Prev
          </button>
          <span>
            Page {data?.page ?? page} of {pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages || isLoading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-outline-variant/30 dark:border-zinc-600 disabled:opacity-40 hover:bg-surface dark:hover:bg-zinc-800"
          >
            Next <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
