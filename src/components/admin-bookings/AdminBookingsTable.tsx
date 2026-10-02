import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  Eye,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";
import {
  adminService,
  type AdminPlatformBooking,
} from "@/services/admin.service";
import type { AdminBookingStatusFilter } from "@/hooks/useAdminBookings";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminBulkActionBar } from "@/components/admin/AdminBulkActionBar";
import { exportBookingsCsv } from "@/lib/csvExport";
import {
  BOOKING_STATUS_CONFIG,
  fmtCurrency,
  formatBookingDate,
} from "./adminBookingsUtils";

interface AdminBookingsTableProps {
  bookings: AdminPlatformBooking[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  totalBookings: number;
  statusFilter: AdminBookingStatusFilter;
  search: string;
  onStatusChange: (status: AdminBookingStatusFilter) => void;
  onSearch: (value: string) => void;
  onSearchImmediate?: (value: string) => void;
  setPage: (p: number | ((prev: number) => number)) => void;
  onSelectBooking: (booking: AdminPlatformBooking) => void;
  refetch: () => void;
}

const STATUS_TABS: { key: AdminBookingStatusFilter; label: string }[] = [
  { key: "all", label: "All Bookings" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "paymentExpired", label: "Payment Expired" },
];

export function AdminBookingsTable({
  bookings,
  isLoading,
  isError,
  page,
  totalPages,
  totalBookings,
  statusFilter,
  search,
  onStatusChange,
  onSearch,
  onSearchImmediate,
  setPage,
  onSelectBooking,
  refetch,
}: AdminBookingsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExportingAll, setIsExportingAll] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, statusFilter, search]);

  const handleExportAll = async () => {
    try {
      setIsExportingAll(true);
      const res = await adminService.getAllBookings({
        limit: 1000,
        status: statusFilter === "all" ? undefined : statusFilter,
        q: search.trim() || undefined,
      });
      const allMatching = res.data.data;
      if (!allMatching || allMatching.length === 0) {
        toast.error("No bookings available to export");
        return;
      }
      exportBookingsCsv(allMatching, `bookings-${statusFilter}`);
      toast.success(`Exported ${allMatching.length} bookings to CSV`);
    } catch {
      toast.error("Failed to export bookings");
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleExportSelected = () => {
    const selected = bookings.filter((b) => selectedIds.has(b._id));
    if (selected.length === 0) return;
    exportBookingsCsv(selected, "selected-bookings");
    toast.success(`Exported ${selected.length} selected bookings to CSV`);
  };

  const handleCopySelectedRefs = () => {
    const selected = bookings.filter((b) => selectedIds.has(b._id));
    const refs = selected.map((b) => b.txRef || b._id).filter(Boolean);
    if (refs.length === 0) return;
    navigator.clipboard.writeText(refs.join("\n"));
    toast.success(`Copied ${refs.length} references to clipboard`);
  };

  const copyRef = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Transaction reference copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Status Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 p-1 bg-surface-container-low dark:bg-[#232729] rounded-xl w-fit">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onStatusChange(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === key
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Search txRef, guest, host, experience..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (onSearchImmediate) {
                    onSearchImmediate(search);
                  } else {
                    onSearch(search);
                  }
                }
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-[#2d3133] border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            disabled={isExportingAll || totalBookings === 0}
            onClick={handleExportAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#2d3133] border border-outline-variant/20 hover:border-primary/40 text-xs font-semibold text-primary transition-all shadow-sm hover:shadow disabled:opacity-50 shrink-0"
            title="Export all matching reservations to CSV"
          >
            {isExportingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#2d3133] rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-on-surface-variant">
              Loading platform bookings...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm font-semibold">Failed to load bookings</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-surface-container-low dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-outline-variant">
              <CalendarCheck className="h-7 w-7" />
            </div>
            <p className="font-headline font-bold text-base text-primary mb-1">
              No bookings found
            </p>
            <p className="text-xs text-on-surface-variant max-w-sm">
              {search
                ? `No reservations match "${search}". Try searching by a different term or clear filters.`
                : "No reservations exist under this status filter."}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => onSearch("")}
                className="mt-4 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/50 dark:bg-zinc-800/40">
                    <th className="py-3.5 pl-5 pr-2 w-10">
                      <Checkbox
                        checked={
                          bookings.length > 0 &&
                          selectedIds.size === bookings.length
                            ? true
                            : selectedIds.size > 0
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds(new Set(bookings.map((b) => b._id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        aria-label="Select all bookings on this page"
                      />
                    </th>
                    <th className="py-3.5 px-4">Ref / ID</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Experience</th>
                    <th className="py-3.5 px-4">Guest</th>
                    <th className="py-3.5 px-4">Host</th>
                    <th className="py-3.5 px-4">Total Price</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-xs">
                  {bookings.map((b) => {
                    const statusConf = BOOKING_STATUS_CONFIG[b.status] || {
                      label: b.status,
                      className: "bg-surface-container text-on-surface",
                    };
                    const txRefDisplay = b.txRef || b._id.slice(-8);

                    return (
                      <tr
                        key={b._id}
                        onClick={() => onSelectBooking(b)}
                        className={`hover:bg-surface-container-low/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group ${
                          selectedIds.has(b._id)
                            ? "bg-primary/5 dark:bg-primary/10"
                            : ""
                        }`}
                      >
                        <td
                          className="py-3.5 pl-5 pr-2 w-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedIds.has(b._id)}
                            onCheckedChange={(checked) => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (checked) next.add(b._id);
                                else next.delete(b._id);
                                return next;
                              });
                            }}
                            aria-label={`Select booking ${b.txRef || b._id}`}
                          />
                        </td>
                        {/* Ref / ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-primary">
                            <span
                              className="truncate max-w-[120px]"
                              title={b.txRef || b._id}
                            >
                              {txRefDisplay}
                            </span>
                            {b.txRef && (
                              <button
                                type="button"
                                onClick={(e) => copyRef(b.txRef!, e)}
                                className="p-1 rounded hover:bg-surface-container text-on-surface-variant/60 hover:text-primary transition-colors"
                                title="Copy full reference"
                              >
                                {copiedId === b.txRef ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Occurrence Date */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <p className="font-semibold text-on-surface">
                            {formatBookingDate(b.experienceDate || b.createdAt)}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/70">
                            Booked {formatBookingDate(b.createdAt)}
                          </p>
                        </td>

                        {/* Experience */}
                        <td className="py-3.5 px-5 max-w-[220px]">
                          <div className="flex items-center gap-2.5">
                            {b.experience?.imageCover ? (
                              <img
                                src={b.experience.imageCover}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-surface-container"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant flex-shrink-0">
                                EXP
                              </div>
                            )}
                            <div className="truncate">
                              <Link
                                to={`/admin/experiences?search=${encodeURIComponent(b.experience?.title || "")}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-primary truncate hover:underline block"
                                title="Inspect experience in Catalog"
                              >
                                {b.experience?.title || "Untitled Experience"}
                              </Link>
                              <p className="text-[10px] text-on-surface-variant truncate">
                                {b.experience?.location || "Ethiopia"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Guest */}
                        <td className="py-3.5 px-5 max-w-[180px]">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/users?search=${encodeURIComponent(b.user?.email || "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 hover:opacity-80 transition-opacity"
                              title="Inspect guest in Users"
                            >
                              <UserAvatar
                                name={b.user?.name || "Guest"}
                                photo={b.user?.photo}
                                className="w-7 h-7 rounded-full flex-shrink-0"
                                initialsClassName="text-xs"
                              />
                            </Link>
                            <div className="truncate">
                              <Link
                                to={`/admin/users?search=${encodeURIComponent(b.user?.email || "")}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-semibold text-on-surface truncate hover:text-primary hover:underline block"
                                title="Inspect guest in Users"
                              >
                                {b.user?.name || "Guest User"}
                              </Link>
                              <p className="text-[10px] text-on-surface-variant truncate">
                                {b.user?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Host */}
                        <td className="py-3.5 px-5 max-w-[160px]">
                          <div className="truncate">
                            <Link
                              to={`/admin/users?search=${encodeURIComponent(b.experience?.host?.email || "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-on-surface truncate hover:text-primary hover:underline block"
                              title="Inspect host in Users"
                            >
                              {b.experience?.host?.name || "Host"}
                            </Link>
                            <p className="text-[10px] text-on-surface-variant truncate">
                              {b.experience?.host?.email || "—"}
                            </p>
                          </div>
                        </td>

                        {/* Price & Guests */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <p className="font-extrabold text-primary">
                            {fmtCurrency(b.price)}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            {b.quantity} {b.quantity === 1 ? "guest" : "guests"}{" "}
                            •{" "}
                            <span
                              className={
                                b.paid
                                  ? "text-emerald-600 font-semibold"
                                  : "text-amber-600 font-semibold"
                              }
                            >
                              {b.paid ? "Paid" : "Unpaid"}
                            </span>
                          </p>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusConf.className}`}
                          >
                            {statusConf.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectBooking(b);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-primary hover:bg-surface-container transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
              <span>
                Showing{" "}
                <span className="font-bold text-on-surface">
                  {bookings.length ? (page - 1) * 10 + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-bold text-on-surface">
                  {Math.min(page * 10, totalBookings)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-on-surface">
                  {totalBookings}
                </span>{" "}
                bookings
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg text-primary disabled:opacity-30 hover:bg-surface-container transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((num, i) => (
                  <button
                    key={`${num}-${i}`}
                    type="button"
                    onClick={() => typeof num === "number" && setPage(num)}
                    className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all ${
                      page === num
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg text-primary disabled:opacity-30 hover:bg-surface-container transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      <AdminBulkActionBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
      >
        <button
          type="button"
          onClick={handleExportSelected}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export Selected (CSV)
        </button>
        <button
          type="button"
          onClick={handleCopySelectedRefs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Refs
        </button>
      </AdminBulkActionBar>
    </div>
  );
}
