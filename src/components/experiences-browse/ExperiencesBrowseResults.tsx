import { ArrowDown, Loader2 } from "lucide-react";
import { ExperienceBrowseCard } from "@/components/experiences-browse/ExperienceBrowseCard";
import { ExperiencesBrowseSkeletonCard } from "@/components/experiences-browse/ExperiencesBrowseSkeletonCard";
import { Button } from "@/components/ui/button";
import type { ExperiencesBrowseVM } from "@/hooks/useExperiencesBrowse";

type Props = { browse: ExperiencesBrowseVM };

export function ExperiencesBrowseResults({ browse }: Props) {
  const {
    pageSize,
    pageItems,
    showListSkeletons,
    noMatches,
    unfilteredEmpty,
    showSummaryBar,
    clearAll,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
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

      {!noMatches && hasNextPage ? (
        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="min-w-[12rem] gap-2 border-outline-variant/50 font-headline text-sm font-semibold"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              <>
                Load more
                <ArrowDown className="h-4 w-4 opacity-70" aria-hidden />
              </>
            )}
          </Button>
        </div>
      ) : null}
    </>
  );
}
