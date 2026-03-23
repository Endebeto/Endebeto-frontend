import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, MapPin, Users, Timer, Star, MoreVertical,
  CheckCircle2, Clock, XCircle, Pencil, Calendar,
  Trash2, Eye, Search, SlidersHorizontal,
} from "lucide-react";
import HostLayout from "@/components/HostLayout";

/* ─── types ──────────────────────────────────────────── */
type ExpStatus = "approved" | "pending" | "rejected";

interface HostExperience {
  id: string;
  title: string;
  image: string;
  location: string;
  price: number;
  duration: string;
  maxGuests: number;
  nextOccurrenceAt: string | null;
  status: ExpStatus;
  ratingsAverage: number;
  ratingsQuantity: number;
  bookingsThisMonth: number;
  rejectionReason?: string;
}

/* ─── mock data ──────────────────────────────────────── */
const MOCK: HostExperience[] = [
  {
    id: "1", title: "Highland Coffee Ceremony",
    image: "/imgs/hero-2.jpg",
    location: "Lalibela, Amhara", price: 650, duration: "2 hours", maxGuests: 6,
    nextOccurrenceAt: "Mar 15, 2026", status: "approved",
    ratingsAverage: 4.9, ratingsQuantity: 24, bookingsThisMonth: 18,
  },
  {
    id: "2", title: "Simien Peaks Trek",
    image: "/imgs/hero-1.jpg",
    location: "Simien Mountains", price: 1200, duration: "6 hours", maxGuests: 10,
    nextOccurrenceAt: "Mar 22, 2026", status: "approved",
    ratingsAverage: 4.8, ratingsQuantity: 18, bookingsThisMonth: 12,
  },
  {
    id: "3", title: "Gourmet Injera Workshop",
    image: "/imgs/hero-3.jpg",
    location: "Addis Ababa", price: 500, duration: "3 hours", maxGuests: 8,
    nextOccurrenceAt: "Mar 18, 2026", status: "approved",
    ratingsAverage: 4.7, ratingsQuantity: 12, bookingsThisMonth: 9,
  },
  {
    id: "4", title: "Gondar Castles Cultural Walk",
    image: "/imgs/hero-1.jpg",
    location: "Gondar, Amhara", price: 800, duration: "4 hours", maxGuests: 12,
    nextOccurrenceAt: null, status: "pending",
    ratingsAverage: 0, ratingsQuantity: 0, bookingsThisMonth: 0,
  },
  {
    id: "5", title: "Danakil Night Sky Tour",
    image: "/imgs/hero-2.jpg",
    location: "Danakil, Afar", price: 2000, duration: "Full day", maxGuests: 6,
    nextOccurrenceAt: null, status: "rejected",
    ratingsAverage: 0, ratingsQuantity: 0, bookingsThisMonth: 0,
    rejectionReason: "Insufficient safety documentation for extreme-environment tours.",
  },
];

/* ─── status config ──────────────────────────────────── */
const statusCfg: Record<ExpStatus, { label: string; icon: React.ElementType; cls: string }> = {
  approved: { label: "Live",    icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
  pending:  { label: "Pending", icon: Clock,        cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
  rejected: { label: "Rejected",icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
};

/* ─── action menu ────────────────────────────────────── */
function ActionMenu({ exp, onDelete }: { exp: HostExperience; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-1.5 rounded-full hover:bg-surface-container dark:hover:bg-zinc-700 text-on-surface-variant transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-outline-variant/20 dark:border-zinc-700 overflow-hidden py-1">
            <Link
              to={`/experiences/${exp.id}`}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-700 transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-on-surface-variant" /> View Listing
            </Link>
            <Link
              to={`/host/experiences/${exp.id}/edit`}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-700 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-on-surface-variant" /> Edit
            </Link>
            {exp.status === "approved" && (
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-700 transition-colors">
                <Calendar className="h-3.5 w-3.5 text-on-surface-variant" /> Set Next Date
              </button>
            )}
            <div className="my-1 border-t border-outline-variant/20 dark:border-zinc-700" />
            <button
              onClick={() => { onDelete(exp.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── experience card ────────────────────────────────── */
function ExpCard({ exp, onDelete }: { exp: HostExperience; onDelete: (id: string) => void }) {
  const s = statusCfg[exp.status];
  const Icon = s.icon;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/10 dark:border-zinc-700 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {/* image */}
      <div className="relative h-44 bg-surface-container dark:bg-zinc-800 overflow-hidden">
        <img
          src={exp.image}
          alt={exp.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* status badge */}
        <span className={`absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.cls}`}>
          <Icon className="h-3 w-3" />
          {s.label}
        </span>
        {/* action menu */}
        <div className="absolute top-2.5 right-2.5">
          <ActionMenu exp={exp} onDelete={onDelete} />
        </div>
      </div>

      {/* body */}
      <div className="p-5">
        <h3 className="font-headline font-bold text-sm text-on-surface dark:text-white mb-2 leading-tight line-clamp-2">
          {exp.title}
        </h3>

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

        {/* rating + price row */}
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

        {/* next date / booking count */}
        {exp.status === "approved" && (
          <div className="pt-3 border-t border-outline-variant/10 dark:border-zinc-700 flex items-center justify-between">
            <div>
              {exp.nextOccurrenceAt ? (
                <p className="text-xs text-on-surface-variant dark:text-zinc-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Next: <strong className="text-on-surface dark:text-white">{exp.nextOccurrenceAt}</strong></span>
                </p>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">No date set</p>
              )}
            </div>
            <span className="text-[10px] font-bold text-primary dark:text-green-400 bg-primary/8 dark:bg-primary/20 px-2 py-0.5 rounded-full">
              {exp.bookingsThisMonth} bookings/mo
            </span>
          </div>
        )}

        {/* rejection reason */}
        {exp.status === "rejected" && exp.rejectionReason && (
          <div className="mt-3 pt-3 border-t border-outline-variant/10 dark:border-zinc-700">
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed line-clamp-2">{exp.rejectionReason}</p>
            <Link
              to={`/host/experiences/${exp.id}/edit`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-green-400 hover:underline"
            >
              <Pencil className="h-3 w-3" /> Edit & Resubmit
            </Link>
          </div>
        )}

        {/* pending note */}
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
type TabFilter = "all" | ExpStatus;

export default function HostExperiences() {
  const [search, setSearch] = useState("");
  const [tab, setTab]       = useState<TabFilter>("all");
  const [exps, setExps]     = useState<HostExperience[]>(MOCK);

  const counts = {
    all:      exps.length,
    approved: exps.filter((e) => e.status === "approved").length,
    pending:  exps.filter((e) => e.status === "pending").length,
    rejected: exps.filter((e) => e.status === "rejected").length,
  };

  const filtered = exps.filter((e) => {
    const matchTab    = tab === "all" || e.status === tab;
    const q           = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleDelete = (id: string) =>
    setExps((p) => p.filter((e) => e.id !== id));

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "all",      label: "All" },
    { key: "approved", label: "Live" },
    { key: "pending",  label: "Pending" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <HostLayout
      hostName="Selamawit T."
      hostInitials="ST"
      hostTitle="Superhost"
      searchValue={search}
      onSearch={setSearch}
    >
      <main className="p-10 max-w-[1440px]">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight">
              My Experiences
            </h1>
            <p className="text-on-surface-variant dark:text-zinc-400 mt-1">
              Manage and monitor all your hosted experiences.
            </p>
          </div>
          <Link
            to="/host/experiences/create"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm"
          >
            <Plus className="h-4 w-4" />
            New Experience
          </Link>
        </div>

        {/* ── Stats strip ────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Experiences", value: counts.all,
              color: "text-primary dark:text-green-400",
              circle1: "rgba(0,82,52,0.12)", circle2: "rgba(0,82,52,0.07)",
            },
            {
              label: "Live",              value: counts.approved,
              color: "text-emerald-600 dark:text-emerald-400",
              circle1: "rgba(5,150,105,0.15)", circle2: "rgba(5,150,105,0.08)",
            },
            {
              label: "Pending Review",    value: counts.pending,
              color: "text-amber-600 dark:text-amber-400",
              circle1: "rgba(217,119,6,0.15)", circle2: "rgba(217,119,6,0.08)",
            },
            {
              label: "Rejected",          value: counts.rejected,
              color: "text-red-600 dark:text-red-400",
              circle1: "rgba(186,26,26,0.12)", circle2: "rgba(186,26,26,0.07)",
            },
          ].map((s) => (
            <div key={s.label} className="relative bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-outline-variant/10 dark:border-zinc-700 shadow-sm overflow-hidden group">
              {/* decorative circles */}
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ background: s.circle1 }} />
              <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ background: s.circle2 }} />
              {/* content */}
              <p className={`relative text-2xl font-headline font-black ${s.color}`}>{s.value}</p>
              <p className="relative text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filter bar ─────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {/* tabs */}
          <div className="flex items-center gap-1 bg-surface-container-low dark:bg-zinc-800 rounded-xl p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === t.key
                    ? "bg-white dark:bg-zinc-700 text-primary dark:text-green-400 shadow-sm"
                    : "text-on-surface-variant dark:text-zinc-400 hover:text-on-surface dark:hover:text-white"
                }`}
              >
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key
                    ? "bg-primary/10 text-primary dark:bg-green-400/15 dark:text-green-400"
                    : "bg-outline-variant/20 dark:bg-zinc-700 text-on-surface-variant dark:text-zinc-400"
                }`}>
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          {/* search */}
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

        {/* ── Card grid ──────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="h-6 w-6 text-on-surface-variant dark:text-zinc-500" />
            </div>
            <p className="font-headline font-bold text-on-surface dark:text-white mb-1">No experiences found</p>
            <p className="text-sm text-on-surface-variant dark:text-zinc-400 mb-6">
              {search ? "Try a different search term" : `You have no ${tab === "all" ? "" : tab} experiences yet.`}
            </p>
            {!search && (
              <Link
                to="/host/experiences/create"
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" /> Create Your First Experience
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((exp) => (
              <ExpCard key={exp.id} exp={exp} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </HostLayout>
  );
}
