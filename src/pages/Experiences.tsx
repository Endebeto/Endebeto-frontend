import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  ChevronDown,
  X,
  Calendar,
  ListFilter,
  Ticket,
} from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  buildExperiencesBrowseParams,
  experiencesService,
  type Experience,
} from "@/services/experiences.service";
import { cn } from "@/lib/utils";
import {
  experienceUrlStringEquals,
  parseExperiencesUrlSearch,
  serializeExperiencesUrl,
} from "@/lib/experiencesBrowseUrl";

/* ─── constants ─────────────────────────────────────────── */

const SORT_OPTIONS = [
  "Newest First",
  "Soonest occurrence",
  "Highest Rating",
  "Price: Low to High",
  "Price: High to Low",
];

const PAGE_SIZE = 10;

/* ─── card ──────────────────────────────────────────────── */

function ExperienceBrowseCard({ exp }: { exp: Experience }) {
  const soldOut = exp.isSoldOut === true;
  const fewLeft = !soldOut && typeof exp.spotsLeft === "number" && exp.spotsLeft > 0 && exp.spotsLeft <= 3;

  const badge = soldOut
    ? null
    : exp.ratingsAverage >= 4.9
    ? "Top Rated"
    : exp.ratingsAverage >= 4.7
    ? "Popular"
    : null;

  return (
    <Link
      to={`/experiences/${exp._id}`}
      className="group block cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-2.5 shadow-sm transition-all duration-500 group-hover:shadow-lg">
        <img
          src={exp.imageCover}
          alt={exp.title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700",
            soldOut
              ? "scale-100 grayscale-[50%] brightness-[0.92]"
              : "group-hover:scale-105",
          )}
        />

        {/* Subtle film when sold (reference: dimmed, not a heavy veil) */}
        {soldOut ? (
          <div className="pointer-events-none absolute inset-0 bg-slate-900/15" aria-hidden />
        ) : null}

        {/* SOLD OUT — top-right pill (icon + label), dark semitransparent bar */}
        {soldOut && (
          <div
            className="absolute right-2.5 top-2.5 z-20 flex items-center gap-1 rounded-full bg-slate-900/85 py-1 pl-1.5 pr-2.5 text-white shadow-md backdrop-blur-[2px] sm:right-3 sm:top-3"
            title="Sold out"
          >
            <Ticket className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" strokeWidth={2.5} />
            <span className="font-headline text-[8px] font-bold uppercase leading-none tracking-widest sm:text-[9px]">
              Sold out
            </span>
          </div>
        )}

        {/* Top-left badge (Top Rated / Popular / few spots left) — hidden when sold out */}
        {!soldOut && (badge || fewLeft) && (
          <div className="absolute top-3 left-3">
            {badge && (
              <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                {badge}
              </span>
            )}
            {fewLeft && (
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                {exp.spotsLeft} spot{exp.spotsLeft === 1 ? "" : "s"} left
              </span>
            )}
          </div>
        )}

        {/* Hover CTA */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          {soldOut ? (
            <button
              disabled
              className="w-full bg-white/60 text-gray-500 font-headline font-bold py-1.5 text-xs rounded-lg cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <button className="w-full bg-white text-primary font-headline font-bold py-1.5 text-xs rounded-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
              Book Now
            </button>
          )}
        </div>
      </div>

      <div className="px-0.5">
        <div className="flex justify-between items-start mb-0.5 gap-2">
          <h3 className="font-headline font-bold text-sm text-primary leading-snug line-clamp-2">
            {exp.title}
          </h3>
          <div className="flex items-center gap-0.5 font-bold shrink-0 text-xs text-on-tertiary-container">
            <Star className="h-3 w-3 fill-current" />
            {exp.ratingsAverage.toFixed(1)}
          </div>
        </div>
        <p className="text-on-surface-variant text-xs mb-1.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          {exp.location} &bull; {exp.duration}
        </p>
        {exp.nextOccurrenceAt && (
          <p className="text-[10px] text-on-surface-variant mb-1 flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0 opacity-70" />
            {new Date(exp.nextOccurrenceAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}
        <div className="flex items-center gap-1">
          <span className={`text-sm font-black font-headline ${soldOut ? "text-on-surface-variant" : "text-primary"}`}>
            {exp.price.toLocaleString()} ETB
          </span>
          <span className="text-[11px] text-on-surface-variant">/ person</span>
        </div>
      </div>
    </Link>
  );
}

/* ─── skeleton ──────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl bg-surface-container mb-2.5" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-surface-container rounded" />
        <div className="h-3 w-1/2 bg-surface-container rounded" />
        <div className="h-4 w-1/4 bg-surface-container rounded" />
      </div>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */

const Experiences = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSyncReady = useRef(false);
  const ignoreUrlParse = useRef(0);
  const skipSearchParamsEffectOnce = useRef(true);
  const [urlHydrationDone, setUrlHydrationDone] = useState(false);

  const [sortBy, setSortBy]       = useState("Newest First");
  const [sortOpen, setSortOpen]   = useState(false);
  const [locationQ, setLocationQ] = useState("");
  const [minPrice, setMinPrice]   = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  /** Bottom sheet on small screens, right drawer on md+. */
  const [filterSheetSide, setFilterSheetSide] = useState<"bottom" | "right">("bottom");

  const sortRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setFilterSheetSide(mq.matches ? "right" : "bottom");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sortRef.current?.contains(t)) return;
      setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** Hydrate filter state from the URL (shareable / back-forward). */
  const applyUrlToState = useCallback((p: URLSearchParams) => {
    const s = parseExperiencesUrlSearch(p, 10_000);
    setPage(s.page);
    setSortBy(s.sortBy);
    setLocationQ(s.locationQ);
    setMinPrice(s.minPrice);
    if (s.maxPrice > 0) {
      setMaxPriceFilter(s.maxPrice);
    } else {
      setMaxPriceFilter(0);
    }
    setMinRating(s.minRating);
    setDateFrom(s.dateFrom);
    setDateTo(s.dateTo);
  }, []);

  useLayoutEffect(() => {
    if (urlSyncReady.current) return;
    applyUrlToState(new URLSearchParams(window.location.search));
    urlSyncReady.current = true;
    setUrlHydrationDone(true);
  }, [applyUrlToState]);

  useEffect(() => {
    if (!urlSyncReady.current) return;
    if (ignoreUrlParse.current > 0) {
      ignoreUrlParse.current -= 1;
      return;
    }
    if (skipSearchParamsEffectOnce.current) {
      skipSearchParamsEffectOnce.current = false;
      return;
    }
    applyUrlToState(new URLSearchParams(searchParams));
  }, [searchParams, applyUrlToState]);

  const { data: priceBoundsRes } = useQuery({
    queryKey: ["experiences", "catalog-price-bounds"],
    queryFn: () => experiencesService.getCatalogPriceBounds(),
    staleTime: 5 * 60_000,
  });

  const catalogMaxPrice = priceBoundsRes?.data?.data?.data?.maxPrice ?? 10_000;
  const CATALOG_MAX = catalogMaxPrice > 0 ? catalogMaxPrice : 10_000;

  /* initialise max price filter from server bounds */
  useEffect(() => {
    if (CATALOG_MAX > 0 && maxPriceFilter === 0) {
      setMaxPriceFilter(CATALOG_MAX);
    }
  }, [CATALOG_MAX, maxPriceFilter]);

  /* Keep the address bar in sync (shareable links) without fighting router updates. */
  useEffect(() => {
    if (!urlSyncReady.current) return;
    const next = serializeExperiencesUrl(
      {
        page,
        sortBy,
        locationQ,
        minPrice,
        maxPrice: maxPriceFilter,
        minRating,
        dateFrom,
        dateTo,
      },
      CATALOG_MAX,
    );
    if (experienceUrlStringEquals(next, new URLSearchParams(searchParams)))
      return;
    ignoreUrlParse.current += 1;
    setSearchParams(next, { replace: true });
  }, [
    page,
    sortBy,
    locationQ,
    minPrice,
    maxPriceFilter,
    minRating,
    dateFrom,
    dateTo,
    CATALOG_MAX,
    setSearchParams,
    searchParams,
  ]);

  const listParams = useMemo(
    () =>
      buildExperiencesBrowseParams({
        page,
        limit: PAGE_SIZE,
        sortBy,
        locationQ,
        minPrice,
        maxPriceFilter,
        catalogMaxPrice: CATALOG_MAX,
        minRating,
        dateFrom,
        dateTo,
      }),
    [
      page,
      sortBy,
      locationQ,
      minPrice,
      maxPriceFilter,
      CATALOG_MAX,
      minRating,
      dateFrom,
      dateTo,
    ],
  );

  const { data: listRes, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["experiences", "browse", listParams] as const,
    queryFn: () => experiencesService.getAll(listParams),
    placeholderData: keepPreviousData,
    enabled: urlHydrationDone,
  });

  const listBody = listRes?.data;
  const totalCount = listBody?.results ?? 0;
  const pageItems = listBody?.data?.data ?? [];

  /* active filter flags */
  const locationActive = locationQ.trim() !== "";
  const priceActive = minPrice > 0 || (maxPriceFilter > 0 && maxPriceFilter < CATALOG_MAX);
  const ratingActive = minRating > 0;
  const dateActive = dateFrom !== "" || dateTo !== "";
  const anyActive = locationActive || priceActive || ratingActive || dateActive;
  const showSummaryBar = anyActive;
  const narrowFiltersCount = [locationActive, priceActive, ratingActive, dateActive].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setLocationQ("");
    setMinPrice(0);
    setMaxPriceFilter(CATALOG_MAX);
    setMinRating(0);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, [CATALOG_MAX]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  useEffect(() => {
    if (totalCount <= 0) return;
    if (page > 1) {
      const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      if (page > maxPage) setPage(maxPage);
    }
  }, [page, totalCount]);
  const showListSkeletons =
    !urlHydrationDone || (isLoading && !isPlaceholderData);
  const noMatches = !showListSkeletons && totalCount === 0;
  const unfilteredEmpty = noMatches && !anyActive;

  const pageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16 pb-16 px-4 max-w-7xl mx-auto">

        {/* ── Editorial header + compact controls (no sticky bar) ── */}
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
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen ? (
                <div className="absolute right-0 top-full z-40 mt-1.5 max-h-64 min-w-[12rem] w-full overflow-y-auto rounded-xl border border-outline-variant/20 bg-card py-1 shadow-lg sm:w-auto">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSortBy(opt);
                        setSortOpen(false);
                        setPage(1);
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
                  📍 {locationQ}
                  <button type="button" onClick={() => setLocationQ("")}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ) : null}
              {priceActive ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary">
                  💰 {minPrice.toLocaleString()}–{maxPriceFilter.toLocaleString()} ETB
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPriceFilter(CATALOG_MAX);
                    }}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ) : null}
              {ratingActive ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary">
                  ⭐ {minRating}+
                  <button type="button" onClick={() => setMinRating(0)}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ) : null}
              {dateActive ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary">
                  📅 {dateFrom || "…"} → {dateTo || "…"}
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
                      max={CATALOG_MAX}
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
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSortBy(opt);
                        setPage(1);
                      }}
                      className={`rounded-lg px-3 py-2.5 text-left font-headline text-sm font-semibold transition-colors ${
                        sortBy === opt ? "bg-primary text-primary-foreground" : "bg-surface-container text-on-surface"
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
                className="min-w-0 flex-1 font-headline font-bold"
                onClick={() => setFiltersOpen(false)}
              >
                Show {totalCount} result{totalCount !== 1 ? "s" : ""}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* ── Card grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {showListSkeletons
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
            : pageItems.map((exp) => <ExperienceBrowseCard key={exp._id} exp={exp} />)}
        </div>

        {/* Empty state */}
        {noMatches && (
          <div className="py-20 text-center">
            <p className="text-on-surface-variant text-sm mb-3">
              {unfilteredEmpty
                ? "No experiences are currently scheduled. Check back soon!"
                : "No experiences match your filters."}
            </p>
            {showSummaryBar && (
              <button onClick={clearAll} className="text-xs font-bold text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full bg-surface-container text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers().map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-xs text-on-surface-variant">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-8 h-8 rounded-full font-headline font-bold text-xs transition-all ${
                      page === n
                        ? "bg-primary text-white shadow-md"
                        : "text-primary hover:bg-surface-container"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full bg-surface-container text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Experiences;
