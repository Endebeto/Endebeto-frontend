import type { ExperienceFilters } from "@/services/experiences.service";
import { buildExperiencesBrowseParams } from "@/services/experiences.service";

/** Short `sort` query values for shareable URLs */
export const BROWSE_SORT_SLUG_TO_LABEL: Record<string, string> = {
  newest: "Newest First",
  soonest: "Soonest occurrence",
  rating: "Highest Rating",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

export const BROWSE_SORT_LABEL_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(BROWSE_SORT_SLUG_TO_LABEL).map(([slug, label]) => [label, slug]),
);

export type ExperiencesUrlState = {
  page: number;
  sortBy: string;
  locationQ: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  dateFrom: string;
  dateTo: string;
};

const DEFAULT: ExperiencesUrlState = {
  page: 1,
  sortBy: "Newest First",
  locationQ: "",
  minPrice: 0,
  maxPrice: 0,
  minRating: 0,
  dateFrom: "",
  dateTo: "",
};

function parseIntSafe(v: string | null, d: number): number {
  if (v == null || v === "") return d;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? d : n;
}

function parseFloatSafe(v: string | null, d: number): number {
  if (v == null || v === "") return d;
  const n = parseFloat(v);
  return Number.isNaN(n) ? d : n;
}

/** Parse the browse page’s shareable `?` params into UI/API-related fields. */
export function parseExperiencesUrlSearch(
  p: URLSearchParams,
  _catalogMax: number = 10_000,
): ExperiencesUrlState {
  const page = Math.max(1, parseIntSafe(p.get("page"), 1));
  const sortKey = p.get("sort")?.trim() || "newest";
  const sortBy = BROWSE_SORT_SLUG_TO_LABEL[sortKey] ?? DEFAULT.sortBy;
  const minPrice = Math.max(0, parseIntSafe(p.get("minPrice"), 0));
  const maxP = p.get("maxPrice");
  let maxPrice = 0;
  if (maxP != null && maxP !== "") {
    const n = parseInt(maxP, 10);
    if (!Number.isNaN(n)) maxPrice = Math.max(0, n);
  }
  const minRating = Math.max(0, Math.round(parseFloatSafe(p.get("rating"), 0) * 10) / 10);
  const from = p.get("from")?.trim() || "";
  const to = p.get("to")?.trim() || "";
  return {
    page,
    sortBy,
    locationQ: p.get("q")?.trim() ?? "",
    minPrice,
    maxPrice,
    minRating,
    dateFrom: from,
    dateTo: to,
  };
}

/**
 * Build minimal query string for the browse page. Omits values that match defaults.
 */
export function serializeExperiencesUrl(
  s: ExperiencesUrlState,
  catalogMax: number,
): URLSearchParams {
  const p = new URLSearchParams();
  if (s.page > 1) p.set("page", String(s.page));
  const slug = BROWSE_SORT_LABEL_TO_SLUG[s.sortBy] ?? "newest";
  if (slug !== "newest") p.set("sort", slug);
  if (s.locationQ.trim()) p.set("q", s.locationQ.trim());
  if (s.minPrice > 0) p.set("minPrice", String(s.minPrice));
  if (s.maxPrice > 0 && s.maxPrice < catalogMax) p.set("maxPrice", String(s.maxPrice));
  if (s.minRating > 0) p.set("rating", String(s.minRating));
  if (s.dateFrom) p.set("from", s.dateFrom);
  if (s.dateTo) p.set("to", s.dateTo);
  return p;
}

function normalizeSearchParams(p: URLSearchParams): string {
  const e = Array.from(p.entries())
    .filter(([, v]) => v != null && v !== "")
    .sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
  return new URLSearchParams(e).toString();
}

/** Compare two query strings regardless of key order. */
export function experienceUrlStringEquals(
  a: URLSearchParams,
  b: URLSearchParams,
): boolean {
  return normalizeSearchParams(a) === normalizeSearchParams(b);
}

/** Map the browse page URL to the same `getAll` params the UI would send. */
export function buildApiParamsFromExperiencesUrl(
  p: URLSearchParams,
  catalogMax: number,
  limit: number,
): ExperienceFilters {
  const st = parseExperiencesUrlSearch(p, catalogMax);
  return buildExperiencesBrowseParams({
    page: st.page,
    limit,
    sortBy: st.sortBy,
    locationQ: st.locationQ,
    minPrice: st.minPrice,
    maxPriceFilter: st.maxPrice,
    catalogMaxPrice: catalogMax,
    minRating: st.minRating,
    dateFrom: st.dateFrom,
    dateTo: st.dateTo,
  });
}
