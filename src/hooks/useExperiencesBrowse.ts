import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  EXPERIENCES_BROWSE_PAGE_SIZE,
  EXPERIENCES_BROWSE_SORT_OPTIONS,
} from "@/components/experiences-browse/experiencesBrowseConstants";
import {
  experienceUrlStringEquals,
  parseExperiencesUrlSearch,
  serializeExperiencesUrl,
} from "@/lib/experiencesBrowseUrl";
import { mergeHostAndCatalogCategories } from "@/lib/hostExperienceCategories";
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
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    setSortBy(s.sortBy);
    setLocationQ(s.locationQ);
    setCategory(s.category);
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

  const { data: catalogCategoriesRes } = useQuery({
    queryKey: ["experiences", "catalog-categories"],
    queryFn: () => experiencesService.getCatalogCategories(),
    staleTime: 5 * 60_000,
  });

  const categoryOptions = useMemo(() => {
    const raw = catalogCategoriesRes?.data?.data?.data;
    const base = mergeHostAndCatalogCategories(raw);
    const c = category.trim();
    if (c && !base.includes(c)) return [...base, c];
    return base;
  }, [catalogCategoriesRes, category]);

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
        sortBy,
        locationQ,
        category,
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
    sortBy,
    locationQ,
    category,
    minPrice,
    maxPriceFilter,
    minRating,
    dateFrom,
    dateTo,
    catalogMax,
    setSearchParams,
    searchParams,
  ]);

  const browseFilterKey = useMemo(
    () => ({
      sortBy,
      locationQ,
      category,
      minPrice,
      maxPriceFilter,
      catalogMax,
      minRating,
      dateFrom,
      dateTo,
      limit: EXPERIENCES_BROWSE_PAGE_SIZE,
    }),
    [
      sortBy,
      locationQ,
      category,
      minPrice,
      maxPriceFilter,
      catalogMax,
      minRating,
      dateFrom,
      dateTo,
    ],
  );

  const {
    data: infiniteData,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["experiences", "browse", browseFilterKey] as const,
    queryFn: ({ pageParam }) =>
      experiencesService.getAll(
        buildExperiencesBrowseParams({
          page: pageParam,
          limit: EXPERIENCES_BROWSE_PAGE_SIZE,
          sortBy,
          locationQ,
          category,
          minPrice,
          maxPriceFilter,
          catalogMaxPrice: catalogMax,
          minRating,
          dateFrom,
          dateTo,
        }),
      ),
    initialPageParam: 1,
    getNextPageParam: (lastResponse, allPages) => {
      const { items, total } = normalizeApiList<Experience>(lastResponse.data);
      const loaded = allPages.reduce(
        (sum, pg) => sum + normalizeApiList<Experience>(pg.data).items.length,
        0,
      );
      if (total === 0 || loaded >= total || items.length === 0) return undefined;
      return allPages.length + 1;
    },
    enabled: urlHydrationDone,
  });

  const pageItems = useMemo(
    () =>
      infiniteData?.pages.flatMap((p) =>
        normalizeApiList<Experience>(p.data).items,
      ) ?? [],
    [infiniteData],
  );

  const totalCount = infiniteData?.pages[0]
    ? normalizeApiList<Experience>(infiniteData.pages[0].data).total
    : 0;

  const locationActive = locationQ.trim() !== "";
  const categoryActive = category.trim() !== "";
  const priceActive =
    minPrice > 0 || (maxPriceFilter > 0 && maxPriceFilter < catalogMax);
  const ratingActive = minRating > 0;
  const dateActive = dateFrom !== "" || dateTo !== "";
  const anyActive =
    locationActive || categoryActive || priceActive || ratingActive || dateActive;
  const showSummaryBar = anyActive;
  const narrowFiltersCount = [
    locationActive,
    categoryActive,
    priceActive,
    ratingActive,
    dateActive,
  ].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setLocationQ("");
    setCategory("");
    setMinPrice(0);
    setMaxPriceFilter(catalogMax);
    setMinRating(0);
    setDateFrom("");
    setDateTo("");
  }, [catalogMax]);

  const showListSkeletons = !urlHydrationDone || (isLoading && !infiniteData);
  const noMatches = !showListSkeletons && totalCount === 0;
  const unfilteredEmpty = noMatches && !anyActive;

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
    filtersOpen,
    setFiltersOpen,
    filterSheetSide,
    catalogMax,
    pageItems,
    totalCount,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    locationActive,
    categoryActive,
    priceActive,
    ratingActive,
    dateActive,
    anyActive,
    showSummaryBar,
    narrowFiltersCount,
    clearAll,
    showListSkeletons,
    noMatches,
    unfilteredEmpty,
    categoryOptions,
  };
}

export type ExperiencesBrowseVM = ReturnType<typeof useExperiencesBrowse>;
