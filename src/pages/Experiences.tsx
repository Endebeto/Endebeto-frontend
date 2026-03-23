import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, ChevronLeft, ChevronRight, Star, ChevronDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { experiencesService, type Experience } from "@/services/experiences.service";

/* ─── constants ─────────────────────────────────────────── */

const SORT_OPTIONS = [
  "Newest First",
  "Highest Rating",
  "Price: Low to High",
  "Price: High to Low",
];

const PAGE_SIZE = 8;

/* ─── useOutsideClick ───────────────────────────────────── */

function useOutsideClick(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

/* ─── filter dropdown wrapper ───────────────────────────── */

function FilterDropdown({
  label,
  icon,
  active,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition-colors ${
          active
            ? "bg-primary text-white"
            : "bg-surface-container text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container"
        }`}
      >
        {icon}
        {label}
        <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 bg-white dark:bg-[#2d3133] rounded-xl shadow-lg border border-outline-variant/20 p-3 min-w-[200px] z-50">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── card ──────────────────────────────────────────────── */

function ExperienceBrowseCard({ exp }: { exp: Experience }) {
  const badge =
    exp.ratingsAverage >= 4.9
      ? "Top Rated"
      : exp.ratingsAverage >= 4.7
      ? "Popular"
      : null;

  return (
    <Link to={`/experiences/${exp._id}`} className="group cursor-pointer block">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2.5 shadow-sm group-hover:shadow-lg transition-all duration-500">
        <img
          src={exp.imageCover}
          alt={exp.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {badge && (
          <div className="absolute top-3 left-3">
            <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
              {badge}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button className="w-full bg-white text-primary font-headline font-bold py-1.5 text-xs rounded-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            Book Now
          </button>
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
        <div className="flex items-center gap-1">
          <span className="text-sm font-black text-primary font-headline">
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
  const [sortBy, setSortBy]       = useState("Newest First");
  const [sortOpen, setSortOpen]   = useState(false);
  const [locationQ, setLocationQ] = useState("");
  const [minPrice, setMinPrice]   = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [page, setPage]           = useState(1);

  const sortRef = useRef<HTMLDivElement>(null!);
  useOutsideClick(sortRef, () => setSortOpen(false));

  /* fetch all experiences (scheduled, up to 200) */
  const { data: queryData, isLoading } = useQuery({
    queryKey: ["experiences"],
    queryFn: () => experiencesService.getAll({ limit: 200 }),
  });

  const allExperiences = queryData?.data.data.data ?? [];

  /* derive MAX_PRICE from fetched data (fallback 10000) */
  const MAX_PRICE = useMemo(
    () => (allExperiences.length > 0 ? Math.max(...allExperiences.map((e) => e.price)) : 10000),
    [allExperiences]
  );

  /* initialise maxPriceFilter once data arrives */
  useEffect(() => {
    if (allExperiences.length > 0 && maxPriceFilter === 0) {
      setMaxPriceFilter(MAX_PRICE);
    }
  }, [MAX_PRICE, allExperiences.length, maxPriceFilter]);

  /* active filter flags */
  const locationActive = locationQ.trim() !== "";
  const priceActive    = minPrice > 0 || (maxPriceFilter > 0 && maxPriceFilter < MAX_PRICE);
  const ratingActive   = minRating > 0;

  const clearAll = () => {
    setLocationQ(""); setMinPrice(0); setMaxPriceFilter(MAX_PRICE); setMinRating(0); setPage(1);
  };
  const anyActive = locationActive || priceActive || ratingActive;

  /* filter + sort */
  const filtered = allExperiences
    .filter((e) => {
      if (locationActive && !e.location.toLowerCase().includes(locationQ.toLowerCase())) return false;
      if (e.price < minPrice) return false;
      if (maxPriceFilter > 0 && e.price > maxPriceFilter) return false;
      if (e.ratingsAverage < minRating) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Highest Rating")     return b.ratingsAverage - a.ratingsAverage;
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

        {/* ── Editorial header ── */}
        <header className="mb-8 pt-6">
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl lg:text-5xl text-primary tracking-tight mb-2">
            Curated <span className="text-on-tertiary-container">Heritage</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
            Discover the soul of Ethiopia through authentic coffee ceremonies, ancient
            architectural tours, and highland culinary secrets.
          </p>
        </header>

        {/* ── Sticky filter bar ── */}
        <div className="sticky top-12 z-30 mb-6">
          <div className="bg-white/92 dark:bg-[#1f2325]/92 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-sm border border-outline-variant/20">
            <div className="flex items-center gap-2 flex-wrap justify-between">

              <div className="flex items-center gap-2 flex-wrap">

                {/* Location filter */}
                <FilterDropdown
                  label="Location"
                  icon={<MapPin className="h-3 w-3" />}
                  active={locationActive}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Filter by city</p>
                  <input
                    type="text"
                    placeholder="e.g. Addis Ababa"
                    value={locationQ}
                    onChange={(e) => { setLocationQ(e.target.value); setPage(1); }}
                    className="w-full text-xs border border-outline-variant/40 rounded-lg px-2.5 py-1.5 bg-surface-container focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  {locationQ && (
                    <button onClick={() => setLocationQ("")} className="mt-2 text-[10px] text-on-surface-variant hover:text-primary flex items-center gap-1">
                      <X className="h-3 w-3" /> Clear
                    </button>
                  )}
                </FilterDropdown>

                {/* Price filter */}
                <FilterDropdown
                  label="Price (ETB)"
                  icon={<span className="text-[10px] font-bold">₿</span>}
                  active={priceActive}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Price range</p>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-on-surface-variant">Min</label>
                      <input
                        type="number"
                        min={0}
                        max={maxPriceFilter}
                        value={minPrice}
                        onChange={(e) => { setMinPrice(Number(e.target.value)); setPage(1); }}
                        className="w-full text-xs border border-outline-variant/40 rounded-lg px-2 py-1 bg-surface-container focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-on-surface-variant">Max</label>
                      <input
                        type="number"
                        min={minPrice}
                        max={MAX_PRICE}
                        value={maxPriceFilter}
                        onChange={(e) => { setMaxPriceFilter(Number(e.target.value)); setPage(1); }}
                        className="w-full text-xs border border-outline-variant/40 rounded-lg px-2 py-1 bg-surface-container focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant text-center">
                    {minPrice.toLocaleString()} – {maxPriceFilter.toLocaleString()} ETB
                  </p>
                  {priceActive && (
                    <button onClick={() => { setMinPrice(0); setMaxPriceFilter(MAX_PRICE); }} className="mt-2 text-[10px] text-on-surface-variant hover:text-primary flex items-center gap-1">
                      <X className="h-3 w-3" /> Reset
                    </button>
                  )}
                </FilterDropdown>

                {/* Rating filter */}
                <FilterDropdown
                  label="Rating"
                  icon={<Star className="h-3 w-3" />}
                  active={ratingActive}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Min rating</p>
                  <div className="flex gap-1.5">
                    {[0, 3, 3.5, 4, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => { setMinRating(r); setPage(1); }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                          minRating === r
                            ? "bg-primary text-white"
                            : "bg-surface-container text-on-surface-variant hover:bg-secondary-container"
                        }`}
                      >
                        {r === 0 ? "All" : `${r}+`}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>

                {/* Clear all */}
                {anyActive && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Sort */}
              <div ref={sortRef} className="relative flex items-center gap-2 ml-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hidden sm:block">
                  Sort
                </span>
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-1 text-xs font-headline font-bold text-primary"
                >
                  {sortBy}
                  <ChevronDown className={`h-3 w-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-[#2d3133] rounded-xl shadow-lg border border-outline-variant/20 py-1 min-w-[160px] z-50">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false); setPage(1); }}
                        className={`block w-full text-left px-3 py-1.5 text-xs font-headline font-semibold transition-colors ${
                          sortBy === opt
                            ? "text-primary bg-primary/5"
                            : "text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active filter summary */}
            {anyActive && (
              <div className="mt-2 pt-2 border-t border-outline-variant/20 flex flex-wrap gap-1.5">
                {locationActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    📍 {locationQ}
                    <button onClick={() => setLocationQ("")}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {priceActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    💰 {minPrice.toLocaleString()}–{maxPriceFilter.toLocaleString()} ETB
                    <button onClick={() => { setMinPrice(0); setMaxPriceFilter(MAX_PRICE); }}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {ratingActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    ⭐ {minRating}+
                    <button onClick={() => setMinRating(0)}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                <span className="text-[10px] text-on-surface-variant ml-1 self-center">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Card grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
            : pageItems.map((exp) => <ExperienceBrowseCard key={exp._id} exp={exp} />)}
        </div>

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-on-surface-variant text-sm mb-3">
              {allExperiences.length === 0
                ? "No experiences are currently scheduled. Check back soon!"
                : "No experiences match your filters."}
            </p>
            {anyActive && (
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
