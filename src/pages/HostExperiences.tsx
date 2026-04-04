import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, MapPin, Users, Timer, Star, MoreVertical,
  CheckCircle2, Clock, XCircle, Pencil, Calendar,
  Trash2, Eye, Search, SlidersHorizontal, Loader2,
  RefreshCw, AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HostLayout from "@/components/HostLayout";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { experiencesService, type Experience } from "@/services/experiences.service";

/* ─── helpers ────────────────────────────────────────── */
const isExpired = (exp: Experience) => {
  if (!exp.nextOccurrenceAt) return true;
  return new Date(exp.nextOccurrenceAt) < new Date();
};

const fmtDate = (iso?: string) => {
  if (!iso) return "No date set";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/* ─── types ──────────────────────────────────────────── */
type ExpStatus = "approved" | "pending" | "rejected" | "draft";
type TabFilter = "all" | ExpStatus;

/* ─── status config ──────────────────────────────────── */
const statusCfg: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  approved: { label: "Live",    icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
  pending:  { label: "Pending", icon: Clock,        cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
  rejected: { label: "Rejected",icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
  draft:    { label: "Draft",   icon: Clock,        cls: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700" },
};

/* ─── reschedule modal ───────────────────────────────── */
function RescheduleModal({ exp, onClose }: { exp: Experience; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");

  const minDateTime = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  const mutation = useMutation({
    mutationFn: (iso: string) => experiencesService.updateNextOccurrence(exp._id ?? exp.id, iso),
    onSuccess: () => {
      toast.success("Experience rescheduled successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to reschedule.";
      toast.error(msg);
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/15 dark:border-zinc-700 max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-primary dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface dark:text-white">Reschedule Experience</h3>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5 line-clamp-1">{exp.title}</p>
          </div>
        </div>

        <label className="block text-xs font-bold text-on-surface dark:text-white mb-2">New Date &amp; Time</label>
        <input
          type="datetime-local"
          min={minDateTime}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-5"
        />

        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 dark:border-zinc-600 text-sm font-semibold text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button type="button"
            disabled={!date || mutation.isPending}
            onClick={() => mutation.mutate(new Date(date).toISOString())}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── action menu ────────────────────────────────────── */
function ActionMenu({ exp, onReschedule, onDelete }: { exp: Experience; onReschedule: (exp: Experience) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const id = exp._id ?? exp.id;
  const showReschedule = exp.status === "approved" && isExpired(exp);
  const isPubliclyVisible = exp.status === "approved" && !exp.suspended;

  return (
    <div className="relative">
      <button onClick={() => setOpen((p) => !p)}
        className="p-1.5 rounded-full hover:bg-surface-container dark:hover:bg-zinc-700 text-on-surface-variant transition-colors">
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-outline-variant/20 dark:border-zinc-700 overflow-hidden py-1">
            {isPubliclyVisible && (
              <Link to={`/experiences/${id}`}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-700 transition-colors">
                <Eye className="h-3.5 w-3.5 text-on-surface-variant" /> View Listing
              </Link>
            )}
            <Link to={`/host/experiences/${id}/edit`}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-700 transition-colors">
              <Pencil className="h-3.5 w-3.5 text-on-surface-variant" /> Edit
            </Link>
            {exp.status === "approved" && !showReschedule && (
              <button onClick={() => { onReschedule(exp); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-700 transition-colors">
                <Calendar className="h-3.5 w-3.5 text-on-surface-variant" /> Set Next Date
              </button>
            )}
            <div className="my-1 border-t border-outline-variant/20 dark:border-zinc-700" />
            <button onClick={() => { onDelete(id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── experience card ────────────────────────────────── */
function ExpCard({ exp, onReschedule, onDelete }: { exp: Experience; onReschedule: (e: Experience) => void; onDelete: (id: string) => void }) {
  const isSuspended = exp.status === "approved" && exp.suspended;
  const s = statusCfg[exp.status ?? "draft"] ?? statusCfg.draft;
  const Icon = isSuspended ? AlertCircle : s.icon;
  const expired = isExpired(exp);
  const id = exp._id ?? exp.id;
  const badgeCls = isSuspended
    ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
    : s.cls;
  const badgeLabel = isSuspended ? "Suspended" : s.label;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/10 dark:border-zinc-700 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {/* image */}
      <div className="relative h-44 bg-surface-container dark:bg-zinc-800 overflow-hidden">
        <img
          src={exp.imageCover}
          alt={exp.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "/imgs/hero-1.jpg"; }}
        />
        <span className={`absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeCls}`}>
          <Icon className="h-3 w-3" />{badgeLabel}
        </span>
        <div className="absolute top-2.5 right-2.5">
          <ActionMenu exp={exp} onReschedule={onReschedule} onDelete={onDelete} />
        </div>
      </div>

      {/* body */}
      <div className="p-5">
        <h3 className="font-headline font-bold text-sm text-on-surface dark:text-white mb-2 leading-tight line-clamp-2">
          {exp.title}
        </h3>

        {isSuspended && exp.suspensionReason && (
          <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/25 border border-amber-200/60 dark:border-amber-800/40 rounded-lg px-3 py-2 mb-3 leading-relaxed">
            <span className="font-bold">Platform: </span>
            {exp.suspensionReason}
          </p>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
          <span className="flex items-center gap-1 text-xs text-on-surface-variant dark:text-zinc-400">
            <MapPin className="h-3 w-3" />{exp.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-on-surface-variant dark:text-zinc-400">
            <Timer className="h-3 w-3" />{exp.duration}
          </span>
          <span className="flex items-center gap-1 text-xs text-on-surface-variant dark:text-zinc-400">
            <Users className="h-3 w-3" />Up to {exp.maxGuests}
          </span>
        </div>

        {/* rating + price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {exp.ratingsQuantity > 0 ? (
              <>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-on-surface dark:text-white">{exp.ratingsAverage}</span>
                <span className="text-xs text-on-surface-variant dark:text-zinc-500">({exp.ratingsQuantity})</span>
              </>
            ) : (
              <span className="text-xs text-on-surface-variant dark:text-zinc-500">No reviews yet</span>
            )}
          </div>
          <span className="text-sm font-headline font-bold text-primary dark:text-green-400">
            ETB {exp.price.toLocaleString()}
          </span>
        </div>

        {/* next date / reschedule prompt */}
        {exp.status === "approved" && (
          <div className="pt-3 border-t border-outline-variant/10 dark:border-zinc-700">
            {expired ? (
              <button onClick={() => onReschedule(exp)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
                Reschedule — {exp.nextOccurrenceAt ? "past date" : "no date set"}
              </button>
            ) : (
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Next: <strong className="text-on-surface dark:text-white ml-1">{fmtDate(exp.nextOccurrenceAt)}</strong>
              </p>
            )}
          </div>
        )}

        {/* rejection reason */}
        {exp.status === "rejected" && (
          <div className="mt-3 pt-3 border-t border-outline-variant/10 dark:border-zinc-700">
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed line-clamp-2">
              {(exp as Experience & { rejectionReason?: string }).rejectionReason ?? "Rejected by editorial team."}
            </p>
            <Link to={`/host/experiences/${id}/edit`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-green-400 hover:underline">
              <Pencil className="h-3 w-3" /> Edit &amp; Resubmit
            </Link>
          </div>
        )}

        {exp.status === "pending" && (
          <div className="mt-3 pt-3 border-t border-outline-variant/10 dark:border-zinc-700">
            <p className="text-xs text-amber-600 dark:text-amber-400">Under review — you'll be notified within 48 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────── */
export default function HostExperiences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch]           = useState("");
  const [tab, setTab]                 = useState<TabFilter>("all");
  const [rescheduleExp, setReschedule] = useState<Experience | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-experiences"],
    queryFn: () => experiencesService.getMyExperiences(),
  });

  const exps: Experience[] = data?.data.data.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => experiencesService.delete(id),
    onSuccess: () => {
      toast.success("Experience deleted.");
      queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
    },
    onError: () => toast.error("Failed to delete experience."),
  });

  const counts = {
    all:      exps.length,
    approved: exps.filter((e) => e.status === "approved").length,
    livePublic: exps.filter((e) => e.status === "approved" && !e.suspended).length,
    suspended: exps.filter((e) => e.status === "approved" && e.suspended).length,
    pending:  exps.filter((e) => e.status === "pending").length,
    rejected: exps.filter((e) => e.status === "rejected").length,
    draft:    exps.filter((e) => e.status === "draft").length,
  };

  const filtered = exps.filter((e) => {
    const matchTab    = tab === "all" || e.status === tab;
    const q           = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "all",      label: "All" },
    { key: "approved", label: "Live" },
    { key: "draft",    label: "Drafts" },
  ];

  return (
    <HostLayout
      hostName={user?.name ?? "Host"}
      hostInitials={(user?.name ?? "H").slice(0, 2).toUpperCase()}
      hostTitle="Host"
    >
      {rescheduleExp && (
        <RescheduleModal exp={rescheduleExp} onClose={() => setReschedule(null)} />
      )}

      <main className="p-10 max-w-[1440px]">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight">My Experiences</h1>
            <p className="text-on-surface-variant dark:text-zinc-400 mt-1">Manage and monitor all your hosted experiences.</p>
          </div>
          <Link to="/host/experiences/create"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm">
            <Plus className="h-4 w-4" /> New Experience
          </Link>
        </div>

        {/* ── Stats strip ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total",  value: counts.all,      color: "text-primary dark:text-green-400",       c1: "rgba(0,82,52,0.12)",   c2: "rgba(0,82,52,0.07)" },
            { label: "Live on site", value: counts.livePublic, color: "text-emerald-600 dark:text-emerald-400", c1: "rgba(5,150,105,0.15)", c2: "rgba(5,150,105,0.08)" },
            { label: "Suspended", value: counts.suspended, color: "text-amber-700 dark:text-amber-400", c1: "rgba(180,83,9,0.12)", c2: "rgba(180,83,9,0.06)" },
            { label: "Drafts", value: counts.draft,    color: "text-zinc-500 dark:text-zinc-400",       c1: "rgba(100,116,139,0.12)", c2: "rgba(100,116,139,0.07)" },
          ].map((s) => (
            <div key={s.label} className="relative bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-outline-variant/10 dark:border-zinc-700 shadow-sm overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ background: s.c1 }} />
              <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ background: s.c2 }} />
              <p className={`relative text-2xl font-headline font-black ${s.color}`}>{isLoading ? "—" : s.value}</p>
              <p className="relative text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filter bar ──────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1 bg-surface-container-low dark:bg-zinc-800 rounded-xl p-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === t.key
                    ? "bg-white dark:bg-zinc-700 text-primary dark:text-green-400 shadow-sm"
                    : "text-on-surface-variant dark:text-zinc-400 hover:text-on-surface dark:hover:text-white"
                }`}>
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key
                    ? "bg-primary/10 text-primary dark:bg-green-400/15 dark:text-green-400"
                    : "bg-outline-variant/20 dark:bg-zinc-700 text-on-surface-variant dark:text-zinc-400"
                }`}>
                  {counts[t.key as keyof typeof counts] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Search experiences…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-outline-variant/30 dark:border-zinc-600 rounded-xl text-sm text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all w-60"
            />
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-green-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="h-12 w-12 text-error mb-4" />
            <p className="font-headline font-bold text-on-surface dark:text-white mb-1">Failed to load experiences</p>
            <p className="text-sm text-on-surface-variant dark:text-zinc-400">Please refresh the page to try again.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="h-6 w-6 text-on-surface-variant dark:text-zinc-500" />
            </div>
            <p className="font-headline font-bold text-on-surface dark:text-white mb-1">No experiences found</p>
            <p className="text-sm text-on-surface-variant dark:text-zinc-400 mb-6">
              {search ? "Try a different search term" : `You have no ${tab === "all" ? "" : tab} experiences yet.`}
            </p>
            {!search && (
              <Link to="/host/experiences/create"
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" /> Create Your First Experience
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((exp) => (
              <ExpCard
                key={exp._id ?? exp.id}
                exp={exp}
                onReschedule={setReschedule}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </main>
    </HostLayout>
  );
}
