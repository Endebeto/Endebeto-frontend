import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  EXPERIENCES_BROWSE_PAGE_SIZE,
  EXPERIENCES_BROWSE_SORT_OPTIONS,
} from "@/components/experiences-browse/experiencesBrowseConstants";
import { computeExperiencesBrowsePageNumbers } from "@/components/experiences-browse/experiencesBrowseUtils";
import {
  experienceUrlStringEquals,
  parseExperiencesUrlSearch,
  serializeExperiencesUrl,
} from "@/lib/experiencesBrowseUrl";
import { normalizeApiList } from "@/lib/normalizeApiList";
import {
  buildExperiencesBrowseParams,
  experiencesService,
  type Experience,
} from "@/services/experiences.service";

export function useExperiencesBrowse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSyncReady = useRef(false);
  const ignoreUrlParse = useRef(0);
  const skipSearchParamsEffectOnce = useRef(true);
  const [urlHydrationDone, setUrlHydrationDone] = useState(false);

  const [sortBy, setSortBy] = useState("Newest First");
  const [sortOpen, setSortOpen] = useState(false);
  const [locationQ, setLocationQ] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterSheetSide, setFilterSheetSide] = useState<"bottom" | "right">(
    "bottom",
  );

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
  const catalogMax = catalogMaxPrice > 0 ? catalogMaxPrice : 10_000;

  useEffect(() => {
    if (catalogMax > 0 && maxPriceFilter === 0) {
      setMaxPriceFilter(catalogMax);
    }
  }, [catalogMax, maxPriceFilter]);

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
      catalogMax,
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
    catalogMax,
    setSearchParams,
    searchParams,
  ]);

  const listParams = useMemo(
    () =>
      buildExperiencesBrowseParams({
        page,
        limit: EXPERIENCES_BROWSE_PAGE_SIZE,
        sortBy,
        locationQ,
        minPrice,
        maxPriceFilter,
        catalogMaxPrice: catalogMax,
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
      catalogMax,
      minRating,
      dateFrom,
      dateTo,
    ],
  );

  const { data: listRes, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["experiences", "browse", listParams] as const,
    queryFn: () => experiencesService.getAll(listParams),
    placeholderData: keepPreviousData,
    enabled: urlHydrationDone,
  });

  const listBody = listRes?.data;
  const { items: pageItems, total: totalCount } = normalizeApiList<Experience>(
    listBody,
  );

  const locationActive = locationQ.trim() !== "";
  const priceActive =
    minPrice > 0 || (maxPriceFilter > 0 && maxPriceFilter < catalogMax);
  const ratingActive = minRating > 0;
  const dateActive = dateFrom !== "" || dateTo !== "";
  const anyActive = locationActive || priceActive || ratingActive || dateActive;
  const showSummaryBar = anyActive;
  const narrowFiltersCount = [
    locationActive,
    priceActive,
    ratingActive,
    dateActive,
  ].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setLocationQ("");
    setMinPrice(0);
    setMaxPriceFilter(catalogMax);
    setMinRating(0);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, [catalogMax]);

  const totalPages =
    Math.ceil(totalCount / EXPERIENCES_BROWSE_PAGE_SIZE) || 1;

  useEffect(() => {
    if (totalCount <= 0) return;
    if (page > 1) {
      const maxPage = Math.max(
        1,
        Math.ceil(totalCount / EXPERIENCES_BROWSE_PAGE_SIZE),
      );
      if (page > maxPage) setPage(maxPage);
    }
  }, [page, totalCount]);

  const showListSkeletons =
    !urlHydrationDone || (isLoading && !isPlaceholderData);
  const noMatches = !showListSkeletons && totalCount === 0;
  const unfilteredEmpty = noMatches && !anyActive;

  const paginationItems = useMemo(
    () => computeExperiencesBrowsePageNumbers(totalPages, page),
    [totalPages, page],
  );

  return {
    sortOptions: EXPERIENCES_BROWSE_SORT_OPTIONS,
    pageSize: EXPERIENCES_BROWSE_PAGE_SIZE,
    sortBy,
    setSortBy,
    sortOpen,
    setSortOpen,
    sortRef,
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
    page,
    setPage,
    filtersOpen,
    setFiltersOpen,
    filterSheetSide,
    catalogMax,
    pageItems,
    totalCount,
    isFetching,
    locationActive,
    priceActive,
    ratingActive,
    dateActive,
    anyActive,
    showSummaryBar,
    narrowFiltersCount,
    clearAll,
    totalPages,
    showListSkeletons,
    noMatches,
    unfilteredEmpty,
    paginationItems,
  };
}

export type ExperiencesBrowseVM = ReturnType<typeof useExperiencesBrowse>;
