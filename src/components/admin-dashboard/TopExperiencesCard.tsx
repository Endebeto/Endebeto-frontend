import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass, Loader2, Star, Trophy } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { adminService, type TopExperience } from "@/services/admin.service";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import { fmtEtb, fmtNum } from "./dashboardUtils";

export function TopExperiencesCard() {
  const [by, setBy] = useState<"revenue" | "bookings" | "rating">("revenue");
  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.topExperiences(by),
    queryFn: () =>
      adminService
        .getTopExperiences({ limit: 5, by })
        .then((r) => (Array.isArray(r.data.data) ? r.data.data : [])),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const rows: TopExperience[] = data ?? [];

  return (
    <div className="bg-white dark:bg-[#2d3133] rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-outline-variant/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="h-4 w-4 text-amber-600 shrink-0" />
          <h3 className="font-headline font-extrabold text-sm text-primary truncate">
            Top Experiences
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-0.5">
          {(
            [
              { id: "revenue", label: "Revenue" },
              { id: "bookings", label: "Bookings" },
              { id: "rating", label: "Rating" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setBy(opt.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors ${
                by === opt.id
                  ? "bg-white dark:bg-[#3a4042] text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-outline-variant/10">
        {isLoading && !rows.length ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary/70" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-8">
            No experiences with{" "}
            {by === "rating" ? "reviews" : "paid bookings"} yet.
          </p>
        ) : (
          rows.map((row, i) => (
            <RouterLink
              key={row._id}
              to="/admin/experiences"
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors"
            >
              <span className="w-5 text-center text-xs font-bold text-on-surface-variant tabular-nums">
                {i + 1}
              </span>
              {row.imageCover ? (
                <img
                  src={row.imageCover}
                  alt={row.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Compass className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">
                  {row.title}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {row.host?.name ?? "Unknown host"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {by === "rating" ? (
                  <>
                    <p className="text-xs font-bold text-primary flex items-center gap-0.5 justify-end tabular-nums">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {(row.ratingsAverage ?? 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {row.ratingsQuantity ?? 0} rating
                      {(row.ratingsQuantity ?? 0) === 1 ? "" : "s"}
                    </p>
                  </>
                ) : by === "bookings" ? (
                  <>
                    <p className="text-xs font-bold text-primary tabular-nums">
                      {fmtNum(row.bookings)}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {fmtEtb(row.grossCents)} ETB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-primary tabular-nums">
                      {fmtEtb(row.grossCents)} ETB
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {fmtNum(row.bookings)} bookings
                    </p>
                  </>
                )}
              </div>
            </RouterLink>
          ))
        )}
      </div>
    </div>
  );
}
