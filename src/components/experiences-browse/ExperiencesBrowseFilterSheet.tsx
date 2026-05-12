import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ExperiencesBrowseVM } from "@/hooks/useExperiencesBrowse";

type Props = { browse: ExperiencesBrowseVM };

export function ExperiencesBrowseFilterSheet({ browse }: Props) {
  const {
    sortOptions,
    sortBy,
    setSortBy,
    locationQ,
    setLocationQ,
    minPrice,
    setMinPrice,
    maxPriceFilter,
    setMaxPriceFilter,
    minRating,
    setMinRating,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    setPage,
    filtersOpen,
    setFiltersOpen,
    filterSheetSide,
    catalogMax,
    totalCount,
    isFetching,
    showSummaryBar,
    clearAll,
  } = browse;

  return (
    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
      <SheetContent
        side={filterSheetSide}
        className={cn(
          "flex flex-col gap-0 p-0 [&>button]:z-50 [&>button]:right-4",
          filterSheetSide === "bottom"
            ? "max-h-[92dvh] rounded-t-2xl [&>button]:top-3"
            : "h-full max-h-screen w-full max-w-md border-l sm:max-w-md [&>button]:top-4",
        )}
      >
        <SheetHeader className="space-y-0 border-b border-outline-variant/20 px-4 pb-3 pt-4 text-left">
          <SheetTitle className="font-headline text-lg text-primary">Filters</SheetTitle>
          <p className="pt-1 text-xs text-muted-foreground">Refine listings, then view results.</p>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Location
            </p>
            <input
              type="text"
              placeholder="e.g. Addis Ababa"
              value={locationQ}
              onChange={(e) => {
                setLocationQ(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Price (ETB)
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-on-surface-variant">Min</label>
                <input
                  type="number"
                  min={0}
                  max={maxPriceFilter}
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(Number(e.target.value));
                    setPage(1);
                  }}
                  className="mt-0.5 w-full rounded-lg border border-outline-variant/40 bg-surface-container px-2 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-on-surface-variant">Max</label>
                <input
                  type="number"
                  min={minPrice}
                  max={catalogMax}
                  value={maxPriceFilter}
                  onChange={(e) => {
                    setMaxPriceFilter(Number(e.target.value));
                    setPage(1);
                  }}
                  className="mt-0.5 w-full rounded-lg border border-outline-variant/40 bg-surface-container px-2 py-2 text-sm"
                />
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-on-surface-variant">
              {minPrice.toLocaleString()} – {maxPriceFilter.toLocaleString()} ETB
            </p>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Next session between
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-on-surface-variant">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="mt-0.5 w-full rounded-lg border border-outline-variant/40 bg-surface-container px-2 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant">To</label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="mt-0.5 w-full rounded-lg border border-outline-variant/40 bg-surface-container px-2 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Min rating
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 3, 3.5, 4, 4.5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setMinRating(r);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    minRating === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {r === 0 ? "All" : `${r}+`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Sort
            </p>
            <div className="flex flex-col gap-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSortBy(opt);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-2.5 text-left font-headline text-sm font-semibold transition-colors ${
                    sortBy === opt
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-container text-on-surface"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 border-t border-outline-variant/20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {showSummaryBar ? (
            <Button type="button" variant="outline" className="font-headline" onClick={clearAll}>
              Clear all
            </Button>
          ) : null}
          <Button
            type="button"
            className="min-w-0 flex-1 font-headline font-bold inline-flex items-center justify-center gap-2"
            onClick={() => setFiltersOpen(false)}
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                <span>Loading results…</span>
              </>
            ) : (
              <>
                Show {totalCount} result{totalCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
