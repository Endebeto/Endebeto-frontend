import {
  Banknote,
  Calendar,
  ChevronDown,
  ListFilter,
  Search,
  Star,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExperiencesBrowseVM } from "@/hooks/useExperiencesBrowse";

type Props = { browse: ExperiencesBrowseVM };

export function ExperiencesBrowseHeader({ browse }: Props) {
  const {
    sortOptions,
    sortBy,
    setSortBy,
    sortOpen,
    setSortOpen,
    sortRef,
    locationQ,
    setLocationQ,
    category,
    setCategory,
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
    setFiltersOpen,
    catalogMax,
    totalCount,
    locationActive,
    categoryActive,
    priceActive,
    ratingActive,
    dateActive,
    showSummaryBar,
    narrowFiltersCount,
  } = browse;

  return (
    <header className="mb-8 pt-6">
      <h1 className="font-headline font-extrabold text-3xl md:text-4xl lg:text-5xl text-primary tracking-tight mb-2">
        Curated <span className="text-on-tertiary-container">Heritage</span>
      </h1>
      <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
        Discover the soul of Ethiopia through authentic coffee ceremonies, ancient
        architectural tours, and highland culinary secrets.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full gap-2 border-outline-variant/40 font-headline text-xs font-semibold sm:h-9 sm:w-auto"
          onClick={() => setFiltersOpen(true)}
        >
          <ListFilter className="h-4 w-4 shrink-0" />
          Filters
          {narrowFiltersCount > 0 ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {narrowFiltersCount}
            </span>
          ) : null}
        </Button>

        <div ref={sortRef} className="relative w-full min-w-0 sm:w-auto sm:min-w-[13rem]">
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-outline-variant/40 bg-surface-container px-3 text-left font-headline text-xs font-bold text-primary sm:h-9"
          >
            <span className="truncate">
              <span className="text-on-surface-variant font-semibold">Sort · </span>
              {sortBy}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>
          {sortOpen ? (
            <div className="absolute right-0 top-full z-40 mt-1.5 max-h-64 min-w-[12rem] w-full overflow-y-auto rounded-xl border border-outline-variant/20 bg-card py-1 shadow-lg sm:w-auto">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSortBy(opt);
                    setSortOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left font-headline text-xs font-semibold transition-colors ${
                    sortBy === opt
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {showSummaryBar ? (
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {locationActive ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary">
              <Search className="h-2.5 w-2.5 shrink-0 opacity-90" aria-hidden />
              {locationQ}
              <button type="button" onClick={() => setLocationQ("")}>
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ) : null}
          {categoryActive ? (
            <span className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary">
              <Tag className="h-2.5 w-2.5 shrink-0 opacity-90" aria-hidden />
              <span className="truncate">{category}</span>
              <button type="button" onClick={() => setCategory("")}>
                <X className="h-2.5 w-2.5 shrink-0" />
              </button>
            </span>
          ) : null}
          {priceActive ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary">
              <Banknote className="h-2.5 w-2.5 shrink-0 opacity-90" aria-hidden />
              {minPrice.toLocaleString()}–{maxPriceFilter.toLocaleString()} ETB
              <button
                type="button"
                onClick={() => {
                  setMinPrice(0);
                  setMaxPriceFilter(catalogMax);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ) : null}
          {ratingActive ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary">
              <Star className="h-2.5 w-2.5 shrink-0 opacity-90" aria-hidden />
              {minRating}+
              <button type="button" onClick={() => setMinRating(0)}>
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ) : null}
          {dateActive ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary">
              <Calendar className="h-2.5 w-2.5 shrink-0 opacity-90" aria-hidden />
              {dateFrom || "…"} – {dateTo || "…"}
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ) : null}
          <span className="ml-1 shrink-0 self-center text-[10px] text-on-surface-variant">
            {totalCount} result{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      ) : null}
    </header>
  );
}
