import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hostQueryKeys } from "@/lib/hostQueryKeys";
import {
  Search,
  Mail,
  Users,
  CalendarDays,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Megaphone,
  UserCheck,
  UserX,
  FileText,
  X,
} from "lucide-react";
import { TaxInvoiceModal } from "@/components/tax-invoice/TaxInvoiceModal";
import { UserAvatar } from "@/components/UserAvatar";
import { bookingsService, type Booking } from "@/services/bookings.service";
import {
  experiencesService,
  type Experience,
} from "@/services/experiences.service";
import { normalizeApiList } from "@/lib/normalizeApiList";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { useFocusTrap } from "@/hooks/useFocusTrap";

/* ─── helpers ──────────────────────────────────────────── */
const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AVATAR_COLORS = [
  "bg-secondary-container text-on-secondary-container",
  "bg-primary/10 text-primary",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-[#ffddb8]/60 text-[#653e00]",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
];

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  upcoming: {
    label: "Upcoming",
    cls: "bg-secondary-container text-on-secondary-fixed-variant dark:bg-emerald-900/40 dark:text-green-400",
  },
  completed: {
    label: "Completed",
    cls: "bg-surface-container-high text-on-surface-variant dark:bg-zinc-700 dark:text-zinc-300",
  },
  paymentExpired: {
    label: "Payment Expired",
    cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
};

const TABS = [
  "all",
  "upcoming",
  "completed",
  "paymentExpired",
  "cancelled",
] as const;
type Tab = (typeof TABS)[number];

const PAGE_SIZE = 10;

/* ─── broadcast announcement modal ────────────────────── */
function BroadcastModal({
  isOpen,
  onClose,
  experiences,
}: {
  isOpen: boolean;
  onClose: () => void;
  experiences: Experience[];
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  const [selectedExpId, setSelectedExpId] = useState(
    experiences[0]?._id ?? experiences[0]?.id ?? "",
  );
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (experiences.length > 0 && !selectedExpId) {
      setSelectedExpId(experiences[0]._id ?? experiences[0].id ?? "");
    }
  }, [experiences, selectedExpId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const broadcastMutation = useMutation({
    mutationFn: () =>
      experiencesService.broadcast(selectedExpId, { subject, message }),
    onSuccess: (res) => {
      toast.success(res.data.data.message || "Broadcast announcement sent!");
      onClose();
      setSubject("");
      setMessage("");
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Failed to send broadcast."));
    },
  });

  const canSubmit =
    !!selectedExpId &&
    subject.trim().length >= 3 &&
    subject.trim().length <= 120 &&
    message.trim().length >= 10 &&
    message.trim().length <= 2000 &&
    !broadcastMutation.isPending;

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 p-4 backdrop-blur-sm isolate [pointer-events:auto]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="broadcast-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 my-auto w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 max-h-[min(90vh,680px)] overflow-y-auto outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-green-400">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="broadcast-modal-title"
                className="font-headline font-bold text-lg text-on-surface dark:text-white"
              >
                Broadcast to Guests
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                Send an urgent update email to upcoming session attendees
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-on-surface dark:text-white mb-2">
              Select Experience Session
            </label>
            <select
              value={selectedExpId}
              onChange={(e) => setSelectedExpId(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            >
              {experiences.map((exp) => (
                <option key={exp._id ?? exp.id} value={exp._id ?? exp.id}>
                  {exp.title} (
                  {exp.nextOccurrenceAt
                    ? fmtDate(exp.nextOccurrenceAt)
                    : "No date"}
                  )
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-on-surface dark:text-white">
                Announcement Subject
              </label>
              <span className="text-[11px] text-on-surface-variant dark:text-zinc-500">
                {subject.length}/120
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Meeting point update for Saturday session"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-on-surface dark:text-white">
                Announcement Message
              </label>
              <span className="text-[11px] text-on-surface-variant dark:text-zinc-500">
                {message.length}/2000
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Write your announcement here. All guests booked for this upcoming run will receive this message via email."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-outline-variant/15 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={broadcastMutation.isPending}
            className="flex-1 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-700 text-sm font-semibold text-on-surface dark:text-white hover:bg-surface dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => broadcastMutation.mutate()}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {broadcastMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Megaphone className="h-4 w-4" />
            )}
            Send Announcement
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") ?? document.body,
  );
}

/* ─── guest row ───────────────────────────────────────── */
function GuestRow({
  booking,
  idx,
  onAttendanceChange,
  onViewInvoice,
}: {
  booking: Booking;
  idx: number;
  onAttendanceChange: (
    bookingId: string,
    status: "unmarked" | "checked_in" | "no_show",
  ) => void;
  onViewInvoice: (bookingId: string) => void;
}) {
  const user = booking.user;
  const exp =
    typeof booking.experience === "object" ? booking.experience : null;
  const cfg = STATUS_CFG[booking.status] ?? STATUS_CFG.upcoming;
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
        ETB {(booking.price ?? 0).toLocaleString()}
      </td>

      {/* Status */}
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}
        >
          {cfg.label}
        </span>
      </td>

      {/* Attendance Status & Action */}
      <td className="px-4 py-4 whitespace-nowrap">
        {booking.paid &&
        (booking.status === "upcoming" || booking.status === "completed") ? (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                booking.attendanceStatus === "checked_in"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                  : booking.attendanceStatus === "no_show"
                    ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                    : "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
              }`}
            >
              {booking.attendanceStatus === "checked_in" ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Checked In
                </>
              ) : booking.attendanceStatus === "no_show" ? (
                <>
                  <XCircle className="h-3 w-3" /> No Show
                </>
              ) : (
                "Unmarked"
              )}
            </span>
            <div className="inline-flex rounded-lg border border-outline-variant/30 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800">
              <button
                type="button"
                title="Mark Checked In"
                disabled={booking.attendanceStatus === "checked_in"}
                onClick={() => onAttendanceChange(booking._id, "checked_in")}
                className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-on-surface-variant hover:text-emerald-600 disabled:opacity-30 disabled:cursor-default transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Mark No Show"
                disabled={booking.attendanceStatus === "no_show"}
                onClick={() => onAttendanceChange(booking._id, "no_show")}
                className="p-1 border-l border-outline-variant/20 dark:border-zinc-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-on-surface-variant hover:text-amber-600 disabled:opacity-30 disabled:cursor-default transition-colors"
              >
                <UserX className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant dark:text-zinc-500">
            —
          </span>
        )}
      </td>

      {/* Contact & Receipt */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {mailto ? (
            <a
              href={mailto}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-green-400 hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              Email Guest
            </a>
          ) : (
            <span className="text-xs text-on-surface-variant dark:text-zinc-500">
              —
            </span>
          )}
          {booking.paid && (
            <button
              type="button"
              onClick={() => onViewInvoice(booking._id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-primary dark:hover:text-green-400 hover:underline cursor-pointer"
              title="View Ethiopian Tax Invoice & Receipt"
            >
              <FileText className="h-3.5 w-3.5 text-primary" /> Receipt
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ─── main component ──────────────────────────────────── */
export default function HostBookings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [selectedInvoiceBookingId, setSelectedInvoiceBookingId] = useState<string | null>(null);

  const { data: experiencesData } = useQuery({
    queryKey: hostQueryKeys.experiences.list(),
    queryFn: () => experiencesService.getMyExperiences(),
    staleTime: 60_000,
  });
  const hostExperiences: Experience[] = normalizeApiList<Experience>(
    experiencesData?.data,
  ).items;

  const attendanceMutation = useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: "unmarked" | "checked_in" | "no_show";
    }) => bookingsService.updateAttendance(bookingId, status),
    onSuccess: () => {
      toast.success("Attendance updated");
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.bookings.all() });
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Failed to update attendance."));
    },
  });

  const handleAttendanceChange = (
    bookingId: string,
    status: "unmarked" | "checked_in" | "no_show",
  ) => {
    attendanceMutation.mutate({ bookingId, status });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: hostQueryKeys.bookings.list(tab, page, search),
    queryFn: () =>
      bookingsService.getHostBookings({
        page,
        limit: PAGE_SIZE,
        ...(tab !== "all" ? { tab } : {}),
        ...(search.trim() ? { q: search.trim() } : {}),
      }),
    staleTime: 30_000,
  });

  const body = data?.data;
  const bookings: Booking[] = body?.data ?? [];
  const total = body?.total ?? 0;
  const totalBookings = body?.totalBookings ?? 0;
  const totalPages = Math.max(1, body?.pages ?? 1);
  const summary = body?.summary ?? {
    upcoming: 0,
    completed: 0,
    paymentExpired: 0,
    cancelled: 0,
  };

  const counts: Record<Tab, number> = {
    all: totalBookings,
    upcoming: summary.upcoming,
    completed: summary.completed,
    paymentExpired: summary.paymentExpired ?? 0,
    cancelled: summary.cancelled ?? 0,
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setPage(1);
  };
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <main className="p-4 md:p-10 max-w-[1440px]">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight">
            Guest Bookings
          </h1>
          <p className="text-on-surface-variant dark:text-zinc-400 mt-1 text-sm">
            All bookings across your experiences — see who's coming and contact
            them directly.
          </p>
        </div>
        {hostExperiences.length > 0 && (
          <button
            type="button"
            onClick={() => setBroadcastOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-primary/90 transition-all self-start sm:self-auto shrink-0"
          >
            <Megaphone className="h-4 w-4" />
            Broadcast to Guests
          </button>
        )}
      </header>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Total Bookings",
            value: counts.all,
            color: "text-primary dark:text-green-400",
          },
          {
            label: "Upcoming",
            value: counts.upcoming,
            color: "text-emerald-600 dark:text-green-400",
          },
          {
            label: "Completed",
            value: counts.completed,
            color: "text-on-surface dark:text-zinc-300",
          },
          {
            label: "Cancelled",
            value: counts.cancelled,
            color: "text-red-600 dark:text-red-400",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-outline-variant/10 dark:border-zinc-800 shadow-sm"
          >
            <p className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-widest mb-1">
              {label}
            </p>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary dark:text-green-400" />
            ) : (
              <p className={`text-2xl font-headline font-extrabold ${color}`}>
                {value}
              </p>
            )}
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
                <span
                  className={`ml-1.5 text-[10px] ${tab === t ? "opacity-80" : "opacity-60"}`}
                >
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

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-outline-variant/10 dark:divide-zinc-800">
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-green-400 mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                Loading bookings…
              </p>
            </div>
          ) : isError ? (
            <div className="px-6 py-12 text-center">
              <AlertCircle className="h-6 w-6 text-error mx-auto mb-2" />
              <p className="text-xs text-error">Failed to load bookings.</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CalendarDays className="h-8 w-8 text-on-surface-variant/30 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-on-surface dark:text-white">
                {search
                  ? "No results found"
                  : tab === "all"
                    ? "No bookings yet"
                    : `No ${tab} bookings`}
              </p>
            </div>
          ) : (
            bookings.map((b, i) => {
              const u = b.user;
              const exp =
                typeof b.experience === "object" ? b.experience : null;
              const cfg = STATUS_CFG[b.status] ?? STATUS_CFG.upcoming;
              const colorCls =
                AVATAR_COLORS[
                  ((page - 1) * PAGE_SIZE + i) % AVATAR_COLORS.length
                ];
              const mailto = u?.email
                ? `mailto:${u.email}?subject=${encodeURIComponent(`Your booking: ${exp?.title ?? "experience"}`)}`
                : undefined;

              return (
                <div
                  key={b._id}
                  className="p-4 space-y-3 bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={u?.name ?? "Guest"}
                        photo={u?.photo}
                        className={`w-9 h-9 rounded-full ring-2 ring-white dark:ring-zinc-800 font-headline font-bold text-xs ${colorCls}`}
                        initialsClassName="text-xs"
                        imgClassName="w-full h-full rounded-full object-cover"
                        alt={u?.name ?? ""}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface dark:text-white truncate max-w-[150px]">
                          {u?.name ?? "Guest"}
                        </p>
                        <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 truncate max-w-[150px]">
                          {u?.email ?? "—"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs">
                    {exp?.imageCover && (
                      <img
                        src={exp.imageCover}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <span className="font-medium text-on-surface dark:text-white line-clamp-1">
                      {exp?.title ?? "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-outline-variant/10 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-on-surface-variant dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {fmtDate(b.experienceDate ?? b.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {b.quantity ?? 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary dark:text-green-400">
                        ETB {(b.price ?? 0).toLocaleString()}
                      </span>
                      {b.paid && (
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceBookingId(b._id)}
                          className="flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-green-400 hover:underline cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" /> Receipt
                        </button>
                      )}
                      {mailto && (
                        <a
                          href={mailto}
                          className="flex items-center gap-1 font-semibold text-primary dark:text-green-400 hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" /> Email
                        </a>
                      )}
                    </div>
                  </div>

                  {b.paid &&
                    (b.status === "upcoming" || b.status === "completed") && (
                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 dark:border-zinc-800 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                            b.attendanceStatus === "checked_in"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                              : b.attendanceStatus === "no_show"
                                ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                                : "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                          }`}
                        >
                          {b.attendanceStatus === "checked_in" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Checked In
                            </>
                          ) : b.attendanceStatus === "no_show" ? (
                            <>
                              <XCircle className="h-3 w-3" /> No Show
                            </>
                          ) : (
                            "Unmarked"
                          )}
                        </span>
                        <div className="inline-flex rounded-lg border border-outline-variant/30 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800">
                          <button
                            type="button"
                            title="Mark Checked In"
                            disabled={
                              b.attendanceStatus === "checked_in" ||
                              attendanceMutation.isPending
                            }
                            onClick={() =>
                              handleAttendanceChange(b._id, "checked_in")
                            }
                            className="px-2.5 py-1 flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-on-surface-variant hover:text-emerald-600 disabled:opacity-30 disabled:cursor-default transition-colors text-[11px] font-semibold"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Check In
                          </button>
                          <button
                            type="button"
                            title="Mark No Show"
                            disabled={
                              b.attendanceStatus === "no_show" ||
                              attendanceMutation.isPending
                            }
                            onClick={() =>
                              handleAttendanceChange(b._id, "no_show")
                            }
                            className="px-2.5 py-1 border-l border-outline-variant/20 dark:border-zinc-700 flex items-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-on-surface-variant hover:text-amber-600 disabled:opacity-30 disabled:cursor-default transition-colors text-[11px] font-semibold"
                          >
                            <UserX className="h-3.5 w-3.5" /> No Show
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-3">Guest</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-6 py-3">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-on-surface-variant dark:text-zinc-400">
                      Loading bookings…
                    </p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <AlertCircle className="h-6 w-6 text-error mx-auto mb-2" />
                    <p className="text-sm text-error">
                      Failed to load bookings.
                    </p>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <CalendarDays className="h-8 w-8 text-on-surface-variant/30 dark:text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-on-surface dark:text-white mb-1">
                      {search
                        ? "No results found"
                        : tab === "all"
                          ? "No bookings yet"
                          : `No ${tab} bookings`}
                    </p>
                    <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                      {search
                        ? "Try a different search term."
                        : "Bookings will appear here once guests book your experiences."}
                    </p>
                  </td>
                </tr>
              ) : (
                bookings.map((b, i) => (
                  <GuestRow
                    key={b._id}
                    booking={b}
                    idx={(page - 1) * PAGE_SIZE + i}
                    onAttendanceChange={handleAttendanceChange}
                    onViewInvoice={setSelectedInvoiceBookingId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white dark:bg-zinc-900 border-t border-outline-variant/10 dark:border-zinc-700 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant dark:text-zinc-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {(() => {
                const maxButtons = 7;
                const count = Math.min(totalPages, maxButtons);
                const start = Math.max(
                  1,
                  Math.min(
                    page - Math.floor(count / 2),
                    totalPages - count + 1,
                  ),
                );
                return Array.from({ length: count }, (_, i) => start + i).map(
                  (p) => (
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
                  ),
                );
              })()}
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

      <BroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        experiences={hostExperiences}
      />

      <TaxInvoiceModal
        bookingId={selectedInvoiceBookingId}
        isOpen={Boolean(selectedInvoiceBookingId)}
        onClose={() => setSelectedInvoiceBookingId(null)}
        viewerContext="host"
      />
    </main>
  );
}
