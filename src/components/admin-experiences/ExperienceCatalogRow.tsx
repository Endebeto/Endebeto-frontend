import {
  ChevronRight,
  DollarSign,
  ImageIcon,
  MapPin,
  Timer,
} from "lucide-react";
import type { ExpStatus, TabKey } from "@/components/admin-experiences/experienceAdminUtils";
import {
  expiredBadge,
  fmtDuration,
  hostInitials,
  isExpired,
  locationText,
  statusBadge,
  suspendedBadge,
} from "@/components/admin-experiences/experienceAdminUtils";
import type { AdminExperience } from "@/services/admin.service";

export function ExperienceCatalogRow({
  exp,
  tab,
  isSelected,
  onToggle,
}: {
  exp: AdminExperience;
  tab: TabKey;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const st = (exp.status ?? "draft") as ExpStatus;
  const rowExpired = isExpired(exp);
  const rowBadge =
    tab === "suspended" || exp.suspended
      ? { cls: suspendedBadge, label: "Suspended" }
      : rowExpired
        ? { cls: expiredBadge, label: "Expired" }
        : { cls: statusBadge[st], label: st === "approved" ? "Live" : st };

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-xl border transition-all duration-150 overflow-hidden group ${
        isSelected
          ? "border-primary/30 dark:border-green-400/30 bg-primary/5 dark:bg-primary/10 shadow-sm"
          : "border-outline-variant/20 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary/20 dark:hover:border-zinc-500 hover:shadow-sm"
      }`}
    >
      <div className="flex gap-0">
        <div className="w-24 shrink-0 relative bg-surface-container dark:bg-zinc-800 aspect-[4/3]">
          {exp.imageCover && exp.imageCover !== "__draft__" ? (
            <img
              src={exp.imageCover}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-on-surface-variant/30" />
            </div>
          )}
        </div>

        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-headline font-semibold text-on-surface dark:text-white leading-tight line-clamp-2 flex-1">
              {exp.title}
            </p>
            <span
              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${rowBadge.cls}`}
            >
              {rowBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[8px] font-bold flex items-center justify-center shrink-0">
              {hostInitials(exp.host?.name ?? "")}
            </div>
            <span className="text-[11px] text-on-surface-variant dark:text-zinc-400 truncate">
              {exp.host?.name}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {locationText(exp) && (
              <span className="flex items-center gap-1 text-[11px] text-on-surface-variant dark:text-zinc-400">
                <MapPin className="h-3 w-3" />
                {locationText(exp)}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-on-surface-variant dark:text-zinc-400">
              <DollarSign className="h-3 w-3" />
              ETB {(exp.price ?? 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-on-surface-variant dark:text-zinc-400">
              <Timer className="h-3 w-3" />
              {fmtDuration(exp.duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center pr-3">
          <ChevronRight
            className={`h-4 w-4 transition-all ${
              isSelected
                ? "text-primary dark:text-green-400 translate-x-0.5"
                : "text-outline-variant dark:text-zinc-600"
            }`}
          />
        </div>
      </div>
    </button>
  );
}
