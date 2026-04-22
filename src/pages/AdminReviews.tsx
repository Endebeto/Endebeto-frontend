import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Loader2,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { adminService, type AdminReview } from "@/services/admin.service";

const PAGE_SIZE = 20;

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function Stars({ n }: { n: number }) {
  const v = Math.min(5, Math.max(1, Math.round(n)));
  return (
    <div className="flex items-center gap-0.5" title={`${n} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < v ? "fill-amber-500 text-amber-500" : "text-outline-variant/40"}`}
        />
      ))}
    </div>
  );
}

function ConfirmDeleteModal({
  open,
  review,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  review: AdminReview | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !review || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#2d3133] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="font-headline font-extrabold text-lg text-primary mb-1">
          Delete this review?
        </h3>
        <p className="text-sm text-on-surface-variant mb-2">
          This cannot be undone. The experience’s average rating will be recalculated.
        </p>
        <p className="text-xs text-on-surface line-clamp-3 bg-surface-container-low rounded-lg p-2 mb-6 border border-outline-variant/10">
          {review.review}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function AdminReviews() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const searchEffectSkipMount = useRef(true);

  /* Debounce header search into API `search` param and reset to page 1 (skip first run so fast pagination is not reset) */
  useEffect(() => {
    if (searchEffectSkipMount.current) {
      searchEffectSkipMount.current = false;
      return;
    }
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-reviews", page, search],
    queryFn: () =>
      adminService
        .getAdminReviews({
          page,
          limit: PAGE_SIZE,
          ...(search.trim() ? { search: search.trim() } : {}),
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: () => {
      toast.success("Review removed");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete review");
    },
  });

  const reviews = data?.data?.data ?? [];
  const total = data?.results ?? 0;
  const pages = data?.pages ?? 1;
  const currentPage = data?.page ?? page;

  return (
    <AdminLayout
      searchPlaceholder="Search review text…"
      searchValue={searchInput}
      onSearch={setSearchInput}
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="shrink-0 px-4 md:px-6 py-4 border-b border-outline-variant/10 bg-white/80 dark:bg-zinc-900/80">
          <h1 className="font-headline font-extrabold text-lg text-primary flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary shrink-0" />
            Guest reviews
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Use the search bar above to filter by text. Open a listing on the site or remove reviews from the catalog.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading && !data ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <p className="text-sm text-red-600 text-center py-12">Failed to load reviews.</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-12">
              No reviews found{search ? " for this search." : "."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/10 bg-white dark:bg-[#2d3133] shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Reviewer</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3 w-24">Rating</th>
                    <th className="px-4 py-3 min-w-[200px]">Review</th>
                    <th className="px-4 py-3 w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => {
                    const exp = r.experience;
                    const expId = exp?._id;
                    const publicPath = expId ? `/experiences/${expId}` : null;
                    return (
                      <tr
                        key={r._id}
                        className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 dark:hover:bg-zinc-800/50"
                      >
                        <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                          {fmtDate(r.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-on-surface text-xs">{r.user?.name ?? "—"}</p>
                          <p className="text-[11px] text-on-surface-variant truncate max-w-[180px]">
                            {r.user?.email ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {expId ? (
                            <p className="text-xs font-medium text-on-surface line-clamp-2 max-w-[220px]">
                              {exp?.title ?? "Untitled"}
                            </p>
                          ) : (
                            <span className="text-xs text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Stars n={r.rating} />
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface line-clamp-3 max-w-md">
                          {r.review}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-1 flex-wrap">
                            {publicPath && (
                              <Link
                                to={publicPath}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-primary hover:bg-primary/10"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View on site
                              </Link>
                            )}
                            <Link
                              to="/admin/experiences"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-on-surface-variant hover:bg-surface-container"
                            >
                              Catalog
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(r)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between gap-3 mt-4 text-xs text-on-surface-variant">
              <span>
                {total} review{total === 1 ? "" : "s"}
                {pages > 1 && ` · Page ${currentPage} of ${pages}`}
              </span>
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-outline-variant/20 disabled:opacity-40 hover:bg-surface-container"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-outline-variant/20 disabled:opacity-40 hover:bg-surface-container"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        review={deleteTarget}
        loading={deleteMutation.isPending}
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget._id);
        }}
      />
    </AdminLayout>
  );
}
