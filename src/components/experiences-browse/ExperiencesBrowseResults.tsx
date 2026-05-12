import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExperienceBrowseCard } from "@/components/experiences-browse/ExperienceBrowseCard";
import { ExperiencesBrowseSkeletonCard } from "@/components/experiences-browse/ExperiencesBrowseSkeletonCard";
import type { ExperiencesBrowseVM } from "@/hooks/useExperiencesBrowse";

type Props = { browse: ExperiencesBrowseVM };

export function ExperiencesBrowseResults({ browse }: Props) {
  const {
    pageSize,
    pageItems,
    page,
    setPage,
    showListSkeletons,
    noMatches,
    unfilteredEmpty,
    showSummaryBar,
    clearAll,
    totalPages,
    paginationItems,
  } = browse;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {showListSkeletons
          ? Array.from({ length: pageSize }).map((_, i) => (
              <ExperiencesBrowseSkeletonCard key={i} />
            ))
          : pageItems.map((exp) => <ExperienceBrowseCard key={exp._id} exp={exp} />)}
      </div>

      {noMatches && (
        <div className="py-20 text-center">
          <p className="text-on-surface-variant text-sm mb-3">
            {unfilteredEmpty
              ? "No experiences are currently scheduled. Check back soon!"
              : "No experiences match your filters."}
          </p>
          {showSummaryBar && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-bold text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-full bg-surface-container text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {paginationItems.map((n, i) =>
              n === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="px-1 text-xs text-on-surface-variant"
                >
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n as number)}
                  className={`w-8 h-8 rounded-full font-headline font-bold text-xs transition-all ${
                    page === n
                      ? "bg-primary text-white shadow-md"
                      : "text-primary hover:bg-surface-container"
                  }`}
                >
                  {n}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-full bg-surface-container text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </>
  );
}
