import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Mail, Users, CalendarDays, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import HostLayout from "@/components/HostLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { bookingsService, type Booking } from "@/services/bookings.service";

/* ─── helpers ──────────────────────────────────────────── */
const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const AVATAR_COLORS = [
  "bg-secondary-container text-on-secondary-container",
  "bg-primary/10 text-primary",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-[#ffddb8]/60 text-[#653e00]",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
];

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  upcoming:  { label: "Upcoming",  cls: "bg-secondary-container text-on-secondary-fixed-variant dark:bg-emerald-900/40 dark:text-green-400" },
  completed: { label: "Completed", cls: "bg-surface-container-high text-on-surface-variant dark:bg-zinc-700 dark:text-zinc-300" },
  expired:   { label: "Expired",   cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

const TABS = ["all", "upcoming", "completed", "expired", "cancelled"] as const;
type Tab = (typeof TABS)[number];

const PAGE_SIZE = 15;

/* ─── guest row ───────────────────────────────────────── */
function GuestRow({ booking, idx }: { booking: Booking; idx: number }) {
  const user = booking.user;
  const exp  = typeof booking.experience === "object" ? booking.experience : null;
  const cfg  = STATUS_CFG[booking.status] ?? STATUS_CFG.upcoming;
  const colorCls = AVATAR_COLORS[idx % AVATAR_COLORS.length];

  const mailto = user?.email
    ? `mailto:${user.email}?subject=${encodeURIComponent(`Your booking: ${exp?.title ?? "experience"}`)}`
    : undefined;

  return (
    <tr className="hover:bg-surface-container-low/40 dark:hover:bg-zinc-800/40 transition-colors">
      {/* Guest */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={user?.name ?? "Guest"}
            photo={user?.photo}
            className={`w-9 h-9 rounded-full shrink-0 ring-2 ring-white dark:ring-zinc-800 font-headline font-bold text-xs ${colorCls}`}
            initialsClassName="text-xs"
            imgClassName="w-full h-full rounded-full object-cover"
            alt={user?.name ?? ""}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface dark:text-white truncate max-w-[140px]">
              {user?.name ?? "Unknown"}
            </p>
            <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 truncate max-w-[140px]">
              {user?.email ?? "—"}
            </p>
          </div>
        </div>
      </td>

      {/* Experience */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          {exp?.imageCover && (
            <img
              src={exp.imageCover}
              alt={exp.title}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
            />
          )}
          <span className="text-sm text-on-surface dark:text-white font-medium max-w-[180px] truncate">
            {exp?.title ?? "—"}
          </span>
        </div>
      </td>

      {/* Guests count */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-on-surface dark:text-white">
          <Users className="h-3.5 w-3.5 text-on-surface-variant dark:text-zinc-400" />
          <span className="font-semibold">{booking.quantity ?? 1}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-on-surface-variant dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {fmtDate(booking.experienceDate ?? booking.createdAt)}
        </div>
      </td>

      {/* Amount */}
      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-primary dark:text-green-400">
        ETB {((booking.price ?? 0) * (booking.quantity ?? 1)).toLocaleString()}
      </td>

      {/* Status */}
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}>
          {cfg.label}
        </span>
      </td>

      {/* Contact */}
      <td className="px-6 py-4 whitespace-nowrap">
        {mailto ? (
          <a
            href={mailto}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-green-400 hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            Email Guest
          </a>
        ) : (
          <span className="text-xs text-on-surface-variant dark:text-zinc-500">—</span>
        )}
      </td>
    </tr>
  );
}

/* ─── main component ──────────────────────────────────── */
export default function HostBookings() {
  const { user } = useAuth();

  const [search, setSearch]   = useState("");
  const [tab, setTab]         = useState<Tab>("all");
  const [page, setPage]       = useState(1);

  /* Fetch a large batch so we can do client-side search/filter */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["host-bookings-list"],
    queryFn: () => bookingsService.getHostBookings({ limit: 200 }),
    staleTime: 30_000,
  });

  const allBookings: Booking[] = data?.data.data ?? [];
  const summary = data?.data.summary ?? { upcoming: 0, completed: 0, expired: 0 };

  /* Filter by tab + search */
  const filtered = useMemo(() => {
    let list = tab === "all" ? allBookings : allBookings.filter((b) => b.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => {
        const gName  = b.user?.name?.toLowerCase() ?? "";
        const gEmail = b.user?.email?.toLowerCase() ?? "";
        const expTitle = typeof b.experience === "object"
          ? b.experience.title?.toLowerCase() ?? ""
          : "";
        return gName.includes(q) || gEmail.includes(q) || expTitle.includes(q);
      });
    }
    return list;
  }, [allBookings, tab, search]);

  /* Pagination */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts: Record<Tab, number> = {
    all:       allBookings.length,
    upcoming:  summary.upcoming,
    completed: summary.completed,
    expired:   summary.expired ?? 0,
    cancelled: allBookings.filter((b) => b.status === "cancelled").length,
  };

  const handleTabChange = (t: Tab) => { setTab(t); setPage(1); };
  const handleSearch    = (v: string) => { setSearch(v); setPage(1); };

  return (
    <HostLayout
      hostName={user?.name ?? "Host"}
      hostTitle="Host"
    >
      <main className="p-4 md:p-10 max-w-[1440px]">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight">
            Guest Bookings
          </h1>
          <p className="text-on-surface-variant dark:text-zinc-400 mt-1 text-sm">
            All bookings across your experiences — see who's coming and contact them directly.
          </p>
        </header>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Bookings",  value: counts.all,       color: "text-primary dark:text-green-400" },
            { label: "Upcoming",        value: counts.upcoming,  color: "text-emerald-600 dark:text-green-400" },
            { label: "Completed",       value: counts.completed, color: "text-on-surface dark:text-zinc-300" },
            { label: "Cancelled",       value: counts.cancelled, color: "text-red-600 dark:text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-outline-variant/10 dark:border-zinc-800 shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
              {isLoading
                ? <Loader2 className="h-4 w-4 animate-spin text-primary dark:text-green-400" />
                : <p className={`text-2xl font-headline font-extrabold ${color}`}>{value}</p>
              }
            </div>
          ))}
        </div>

        {/* Card wrapper */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-outline-variant/10 dark:border-zinc-700 overflow-hidden">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors capitalize ${
                    tab === t
                      ? "bg-primary text-white dark:bg-green-700"
                      : "text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800"
                  }`}
                >
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                  <span className={`ml-1.5 text-[10px] ${tab === t ? "opacity-80" : "opacity-60"}`}>
                    ({counts[t]})
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto flex-shrink-0 w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant dark:text-zinc-400" />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search guest or experience…"
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low dark:bg-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>

            <button className="p-2 rounded-lg border border-outline-variant/30 dark:border-zinc-600 hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors text-on-surface-variant dark:text-zinc-400 shrink-0">
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-3">Guest</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-on-surface-variant dark:text-zinc-400">Loading bookings…</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center">
                      <AlertCircle className="h-6 w-6 text-error mx-auto mb-2" />
                      <p className="text-sm text-error">Failed to load bookings.</p>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center">
                      <CalendarDays className="h-8 w-8 text-on-surface-variant/30 dark:text-zinc-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-on-surface dark:text-white mb-1">
                        {search ? "No results found" : tab === "all" ? "No bookings yet" : `No ${tab} bookings`}
                      </p>
                      <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                        {search ? "Try a different search term." : "Bookings will appear here once guests book your experiences."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((b, i) => (
                    <GuestRow key={b._id} booking={b} idx={(page - 1) * PAGE_SIZE + i} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-white dark:bg-zinc-900 border-t border-outline-variant/10 dark:border-zinc-700 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant dark:text-zinc-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      p === page
                        ? "bg-primary text-white dark:bg-green-600"
                        : "text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </HostLayout>
  );
}
