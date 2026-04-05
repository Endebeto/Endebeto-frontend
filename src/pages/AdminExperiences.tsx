import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin, Users, Timer, Star, DollarSign, ImageIcon, Eye, X, ChevronRight,
  Calendar, Loader2, AlertCircle, ExternalLink, Ban, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { adminService, type AdminExperience } from "@/services/admin.service";

type ExpStatus = "pending" | "approved" | "rejected" | "draft";
type TabKey = "live" | "suspended" | "draft";

function hostInitials(name: string) {
  return name?.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "??";
}

function fmtDuration(d: unknown) {
  if (d == null) return "–";
  if (typeof d === "string") return d;
  const mins = Number(d);
  if (Number.isNaN(mins)) return String(d);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function locationText(exp: AdminExperience): string {
  const loc = exp.location as unknown;
  if (!loc) return "";
  if (typeof loc === "string") return loc;
  if (typeof loc === "object" && loc && "address" in (loc as object)) {
    return String((loc as { address?: string }).address ?? "");
  }
  return "";
}

const statusBadge: Record<ExpStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  draft: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600",
};

const suspendedBadge =
  "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700";

const TAB_LABEL: Record<TabKey, string> = {
  live: "Live",
  suspended: "Suspended",
  draft: "Drafts",
};

function SuspendModal({
  exp,
  onClose,
  onConfirm,
  isPending,
}: {
  exp: AdminExperience;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/15 dark:border-zinc-700 max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Ban className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface dark:text-white">Suspend listing</h3>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5 line-clamp-1">{exp.title}</p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-3">
          The listing will disappear from the public catalog until you reinstate it. Hosts will see why it was suspended.
        </p>
        <label className="block text-xs font-bold text-on-surface dark:text-white mb-2">Reason (shown to host)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Pricing or photos need review — please update and contact support."
          className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-5"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 dark:border-zinc-600 text-sm font-semibold text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onConfirm(reason.trim() || "Suspended by platform")}
            className="flex-1 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
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
  const address = locationText(exp) || "Location not set";
  const images = exp.images ?? [];
  // Public experience route is /experiences/:id — always use _id
  const publicPath = `/experiences/${exp._id}`;
  const canViewPublic = status === "approved" && !exp.suspended;
  const showSuspend = tab === "live" && status === "approved" && !exp.suspended;
  const showReinstate = tab === "suspended" && exp.suspended;

  const overlayBadgeClass = exp.suspended ? suspendedBadge : statusBadge[status];
  const overlayLabel = exp.suspended ? "Suspended" : status === "approved" ? "Live" : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="font-headline font-bold text-sm text-on-surface dark:text-white">Listing detail</span>
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
          <h2 className="font-headline font-extrabold text-lg text-on-surface dark:text-white leading-tight mb-1">
            {exp.title}
          </h2>
          <div className="flex items-center gap-2">
            {exp.host?.photo ? (
              <img src={exp.host.photo} alt={exp.host.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/15 dark:bg-primary/30 text-primary dark:text-green-300 text-[10px] font-bold flex items-center justify-center">
                {hostInitials(exp.host?.name ?? "")}
              </div>
            )}
            <span className="text-xs text-on-surface-variant dark:text-zinc-400">
              by <strong className="text-on-surface dark:text-white">{exp.host?.name}</strong>
              <span className="mx-1">·</span>
              {exp.host?.email}
            </span>
          </div>
        </div>

        {exp.suspended && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Platform suspension
            </p>
            {exp.suspensionReason && (
              <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{exp.suspensionReason}</p>
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
            { icon: DollarSign, label: "Price", value: `ETB ${(exp.price ?? 0).toLocaleString()}` },
            { icon: Timer, label: "Duration", value: fmtDuration(exp.duration) },
            { icon: Users, label: "Max guests", value: `${exp.maxGuests ?? "–"} people` },
            {
              icon: Calendar,
              label: "Next date",
              value: exp.nextOccurrenceAt ? new Date(exp.nextOccurrenceAt).toLocaleDateString() : "Not set",
            },
            { icon: Calendar, label: "Created", value: new Date(exp.createdAt).toLocaleDateString() },
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
                <p className="text-xs font-semibold text-on-surface dark:text-white mt-0.5">{s.value}</p>
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
                  className={`h-3.5 w-3.5 ${s <= Math.round(exp.ratingsAverage ?? 0) ? "fill-amber-400 text-amber-400" : "text-outline-variant dark:text-zinc-600"
                    }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-on-surface dark:text-white">{(exp.ratingsAverage ?? 0).toFixed(1)}</span>
            <span className="text-xs text-on-surface-variant dark:text-zinc-400">({exp.ratingsQuantity} reviews)</span>
          </div>
        )}

        {exp.summary && exp.summary !== "__draft__" && (
          <div>
            <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide mb-1.5">
              Summary
            </p>
            <p className="text-sm text-on-surface dark:text-zinc-200 leading-relaxed">{exp.summary}</p>
          </div>
        )}

        {exp.description && exp.description !== "__draft__" && (
          <div>
            <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide mb-1.5">
              Description
            </p>
            <p className="text-sm text-on-surface-variant dark:text-zinc-300 leading-relaxed">{exp.description}</p>
          </div>
        )}

        {status === "rejected" && exp.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Rejection / archive note</p>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{exp.rejectionReason}</p>
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
              >
                {reinstatePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                Reinstate listing
              </button>
            )}
          </div>
        )}

        <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 leading-relaxed border-t border-outline-variant/10 pt-4">
          Suspending hides a listing from guests; hosts keep access and should fix issues described above.
        </p>
      </div>
    </div>
  );
}

export default function AdminExperiences() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("live");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminExperience | null>(null);
  const [suspendModalExp, setSuspendModalExp] = useState<AdminExperience | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-experiences-manage", tab],
    queryFn: () => adminService.getAdminCatalog(tab, { limit: 200 }).then((r) => r.data.data.data),
    staleTime: 30_000,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminService.suspendExperience(id, reason),
    onSuccess: () => {
      toast.success("Listing suspended.");
      queryClient.invalidateQueries({ queryKey: ["admin-experiences-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setSuspendModalExp(null);
      setSelected(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Could not suspend.";
      toast.error(msg);
    },
  });

  const reinstateMutation = useMutation({
    mutationFn: (id: string) => adminService.reinstateExperience(id),
    onSuccess: () => {
      toast.success("Listing reinstated.");
      queryClient.invalidateQueries({ queryKey: ["admin-experiences-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setSelected(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Could not reinstate.";
      toast.error(msg);
    },
  });

  const experiences = data ?? [];
  const filtered = experiences.filter((e) => {
    const q = search.toLowerCase();
    const loc = locationText(e).toLowerCase();
    return (
      !q ||
      e.title.toLowerCase().includes(q) ||
      (e.host?.name ?? "").toLowerCase().includes(q) ||
      loc.includes(q)
    );
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "live", label: TAB_LABEL.live },
    { key: "suspended", label: TAB_LABEL.suspended },
    { key: "draft", label: TAB_LABEL.draft },
  ];

  const emptyLabel = TAB_LABEL[tab].toLowerCase();

  return (
    <AdminLayout
      searchPlaceholder="Search title, host, or location…"
      searchValue={search}
      onSearch={(v) => {
        setSearch(v);
        setSelected(null);
      }}
    >
      {suspendModalExp && (
        <SuspendModal
          exp={suspendModalExp}
          isPending={suspendMutation.isPending}
          onClose={() => setSuspendModalExp(null)}
          onConfirm={(reason) => suspendMutation.mutate({ id: suspendModalExp._id, reason })}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex flex-col border-r border-outline-variant/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all duration-200 ${selected ? "w-[400px] shrink-0" : "flex-1"
            }`}
        >
          <div className="shrink-0 px-5 pt-5 pb-0">
            <div className="mb-4">
              <h1 className="font-headline font-extrabold text-lg text-on-surface dark:text-white">Experience Management</h1>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5">
                Live and suspended listings are approved experiences. Suspend to hide a listing from guests until issues are resolved.
              </p>
            </div>

            <div className="flex gap-1 border-b border-outline-variant/10 dark:border-zinc-700 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setSelected(null);
                  }}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors shrink-0 ${tab === t.key
                    ? "text-primary dark:text-green-400"
                    : "text-on-surface-variant dark:text-zinc-400 hover:text-on-surface dark:hover:text-white"
                    }`}
                >
                  {t.label}
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-green-400 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-2 py-16 text-red-500">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm">Failed to load experiences.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-surface dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <Eye className="h-5 w-5 text-on-surface-variant dark:text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-on-surface dark:text-white mb-1">No {emptyLabel} listings</p>
                <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                  {search ? "Try a different search." : "Nothing in this tab yet."}
                </p>
              </div>
            ) : (
              filtered.map((exp) => {
                const isSelected = selected?._id === exp._id;
                const st = (exp.status ?? "draft") as ExpStatus;
                const rowBadge =
                  tab === "suspended" || exp.suspended
                    ? { cls: suspendedBadge, label: "Suspended" }
                    : { cls: statusBadge[st], label: st === "approved" ? "Live" : st };
                return (
                  <button
                    key={exp._id}
                    onClick={() => setSelected(isSelected ? null : exp)}
                    className={`w-full text-left rounded-xl border transition-all duration-150 overflow-hidden group ${isSelected
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
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${rowBadge.cls}`}>
                            {rowBadge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[8px] font-bold flex items-center justify-center shrink-0">
                            {hostInitials(exp.host?.name ?? "")}
                          </div>
                          <span className="text-[11px] text-on-surface-variant dark:text-zinc-400 truncate">{exp.host?.name}</span>
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
                          className={`h-4 w-4 transition-all ${isSelected ? "text-primary dark:text-green-400 translate-x-0.5" : "text-outline-variant dark:text-zinc-600"
                            }`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {selected && (
          <div className="flex-1 bg-surface dark:bg-zinc-950 overflow-hidden flex flex-col">
            <DetailPanel
              exp={selected}
              tab={tab}
              onClose={() => setSelected(null)}
              onOpenSuspend={() => setSuspendModalExp(selected)}
              onReinstate={() => reinstateMutation.mutate(selected._id)}
              reinstatePending={reinstateMutation.isPending}
            />
          </div>
        )}

        {!selected && (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-surface dark:bg-zinc-950">
            <div className="text-center max-w-sm px-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 border border-outline-variant/20 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Eye className="h-6 w-6 text-on-surface-variant dark:text-zinc-500" />
              </div>
              <p className="font-headline font-bold text-sm text-on-surface dark:text-white mb-1">Select a listing</p>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                Click a row for details. Use Live / Suspended / Drafts / Rejected tabs. Suspend or reinstate from the detail panel.
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
