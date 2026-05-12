import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Ban,
  Calendar,
  DollarSign,
  ExternalLink,
  Eye,
  ImageIcon,
  Loader2,
  MapPin,
  RotateCcw,
  Star,
  Timer,
  Users,
  X,
} from "lucide-react";
import { AdminExperienceHostCard } from "@/components/admin-experiences/AdminExperienceHostCard";
import { ExperienceBookingKpiStrip } from "@/components/admin-experiences/ExperienceBookingKpiStrip";
import { ExperienceBookingsSection } from "@/components/admin-experiences/ExperienceBookingsSection";
import type { ExpStatus, TabKey } from "@/components/admin-experiences/experienceAdminUtils";
import {
  expiredBadge,
  fmtDateSafe,
  fmtDuration,
  isExpired,
  locationText,
  statusBadge,
  suspendedBadge,
} from "@/components/admin-experiences/experienceAdminUtils";
import { ExperienceDescriptionMarkdown } from "@/components/ExperienceDescriptionMarkdown";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import { adminService, type AdminExperience } from "@/services/admin.service";

export function ExperienceDetailPanel({
  exp,
  tab,
  onClose,
  onOpenSuspend,
  onReinstate,
  reinstatePending,
}: {
  exp: AdminExperience;
  tab: TabKey;
  onClose: () => void;
  onOpenSuspend: () => void;
  onReinstate: () => void;
  reinstatePending: boolean;
}) {
  const status = (exp.status ?? "draft") as ExpStatus;

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: adminQueryKeys.experienceDetail(exp._id),
    queryFn: () =>
      adminService.getAdminExperienceDetail(exp._id).then((r) => r.data.data),
    staleTime: 30_000,
  });
  const detailExp = detailData?.experience ?? exp;
  const bookingStats = detailData?.bookingStats;
  const address = locationText(exp) || "Location not set";
  const images = exp.images ?? [];
  const publicPath = `/experiences/${exp._id}`;
  const canViewPublic = status === "approved" && !exp.suspended;
  const showSuspend = tab === "live" && status === "approved" && !exp.suspended;
  const showReinstate = tab === "suspended" && exp.suspended;

  const expired = isExpired(exp);
  const overlayBadgeClass = exp.suspended
    ? suspendedBadge
    : expired
      ? expiredBadge
      : statusBadge[status];
  const overlayLabel = exp.suspended
    ? "Suspended"
    : expired
      ? "Expired"
      : status === "approved"
        ? "Live"
        : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="font-headline font-bold text-sm text-on-surface dark:text-white">
            Listing detail
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canViewPublic && (
            <a
              href={`${window.location.origin}${publicPath}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View on site
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-zinc-800 text-on-surface-variant transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="relative rounded-xl overflow-hidden aspect-video bg-surface-container dark:bg-zinc-800">
          {exp.imageCover && exp.imageCover !== "__draft__" ? (
            <img
              src={exp.imageCover}
              alt={exp.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-on-surface-variant/30" />
            </div>
          )}
          <span
            className={`absolute top-2 right-2 text-[11px] font-bold px-2.5 py-1 rounded-full border ${overlayBadgeClass}`}
          >
            {overlayLabel}
          </span>
        </div>

        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <div
                key={i}
                className="w-16 h-12 rounded-lg overflow-hidden border border-outline-variant/20 dark:border-zinc-700 shrink-0"
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="font-headline font-extrabold text-lg text-on-surface dark:text-white leading-tight mb-3">
            {exp.title}
          </h2>
          <AdminExperienceHostCard exp={detailExp} />
        </div>

        <div>
          <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide mb-2">
            Booking KPIs
          </p>
          <ExperienceBookingKpiStrip
            stats={bookingStats}
            isLoading={detailLoading}
          />
        </div>

        <ExperienceBookingsSection expId={exp._id} />

        {exp.suspended && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Platform
              suspension
            </p>
            {exp.suspensionReason && (
              <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                {exp.suspensionReason}
              </p>
            )}
            {exp.suspendedAt && (
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/90">
                {new Date(exp.suspendedAt).toLocaleString()}
                {exp.suspendedBy?.name && ` · by ${exp.suspendedBy.name}`}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: MapPin, label: "Location", value: address },
            {
              icon: DollarSign,
              label: "Price",
              value: `ETB ${(exp.price ?? 0).toLocaleString()}`,
            },
            { icon: Timer, label: "Duration", value: fmtDuration(exp.duration) },
            {
              icon: Users,
              label: "Max guests",
              value: `${exp.maxGuests ?? "–"} people`,
            },
            {
              icon: Calendar,
              label: "Next date",
              value: exp.nextOccurrenceAt
                ? new Date(exp.nextOccurrenceAt).toLocaleDateString()
                : "Not set",
            },
            {
              icon: Calendar,
              label: "Created",
              value: fmtDateSafe(exp.createdAt),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface dark:bg-zinc-800 rounded-xl p-3 border border-outline-variant/20 dark:border-zinc-700 flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                <s.icon className="h-3.5 w-3.5 text-primary dark:text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 font-medium uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-xs font-semibold text-on-surface dark:text-white mt-0.5">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {(exp.ratingsQuantity ?? 0) > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= Math.round(exp.ratingsAverage ?? 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-outline-variant dark:text-zinc-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-on-surface dark:text-white">
              {(exp.ratingsAverage ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-on-surface-variant dark:text-zinc-400">
              ({exp.ratingsQuantity} reviews)
            </span>
          </div>
        )}

        {exp.summary && exp.summary !== "__draft__" && (
          <div>
            <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide mb-1.5">
              Summary
            </p>
            <p className="text-sm text-on-surface dark:text-zinc-200 leading-relaxed">
              {exp.summary}
            </p>
          </div>
        )}

        {exp.description && exp.description !== "__draft__" && (
          <div>
            <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide mb-1.5">
              Description
            </p>
            <ExperienceDescriptionMarkdown
              markdown={exp.description}
              className="text-sm [&_p]:text-sm [&_li]:text-sm"
            />
          </div>
        )}

        {status === "rejected" && exp.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">
              Rejection / archive note
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              {exp.rejectionReason}
            </p>
          </div>
        )}

        {(showSuspend || showReinstate) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant/10">
            {showSuspend && (
              <button
                type="button"
                onClick={onOpenSuspend}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition-colors"
              >
                <Ban className="h-3.5 w-3.5" /> Suspend listing
              </button>
            )}
            {showReinstate && (
              <button
                type="button"
                disabled={reinstatePending}
                onClick={onReinstate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-green-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
              >
                {reinstatePending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                Reinstate listing
              </button>
            )}
          </div>
        )}

        <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 leading-relaxed border-t border-outline-variant/10 pt-4">
          Suspending hides a listing from guests; hosts keep access and should
          fix issues described above.
        </p>
      </div>
    </div>
  );
}
