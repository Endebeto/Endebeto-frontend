import { describe, expect, it } from "vitest";
import {
  buildApiParamsFromExperiencesUrl,
  experienceUrlStringEquals,
  parseExperiencesUrlSearch,
  serializeExperiencesUrl,
} from "./experiencesBrowseUrl";

const LIMIT = 10;
const CATALOG = 8_000;

describe("parseExperiencesUrlSearch", () => {
  it("uses defaults for empty query", () => {
    const s = parseExperiencesUrlSearch(new URLSearchParams(), CATALOG);
    expect(s).toMatchObject({
      page: 1,
      sortBy: "Newest First",
      locationQ: "",
      minPrice: 0,
      maxPrice: 0,
      minRating: 0,
      dateFrom: "",
      dateTo: "",
    });
  });

  it("parses page, sort, q, price, rating, and dates (includeSold in URL is ignored)", () => {
    const p = new URLSearchParams(
      "page=2&sort=price-desc&q=addis&minPrice=100&maxPrice=2000&rating=4&from=2026-01-10&to=2026-01-20&includeSold=1",
    );
    const s = parseExperiencesUrlSearch(p, CATALOG);
    expect(s).toMatchObject({
      page: 2,
      sortBy: "Price: High to Low",
      locationQ: "addis",
      minPrice: 100,
      maxPrice: 2000,
      minRating: 4,
      dateFrom: "2026-01-10",
      dateTo: "2026-01-20",
    });
  });
});

describe("serialize + parse round-trip", () => {
  it("is stable for typical filters", () => {
    const a = {
      page: 3,
      sortBy: "Soonest occurrence",
      locationQ: "Gondar",
      minPrice: 50,
      maxPrice: 7_000,
      minRating: 4.5,
      dateFrom: "2026-02-01",
      dateTo: "2026-02-28",
    };
    const sp = serializeExperiencesUrl(a, CATALOG);
    const b = parseExperiencesUrlSearch(sp, CATALOG);
    expect(b.page).toBe(a.page);
    expect(b.sortBy).toBe(a.sortBy);
    expect(b.locationQ).toBe(a.locationQ);
    expect(b.minPrice).toBe(a.minPrice);
    expect(b.maxPrice).toBe(a.maxPrice);
    expect(b.minRating).toBe(a.minRating);
    expect(b.dateFrom).toBe(a.dateFrom);
    expect(b.dateTo).toBe(a.dateTo);
  });
});

describe("experienceUrlStringEquals", () => {
  it("ignores key order", () => {
    const a = new URLSearchParams("a=1&b=2");
    const b = new URLSearchParams("b=2&a=1");
    expect(experienceUrlStringEquals(a, b)).toBe(true);
  });
});

describe("buildApiParamsFromExperiencesUrl (URL → getAll query)", () => {
  it("matches buildExperiencesBrowseParams for a complex URL", () => {
    const p = new URLSearchParams("page=1&sort=rating&rating=3.5");
    const api = buildApiParamsFromExperiencesUrl(p, CATALOG, LIMIT);
    expect(api).toMatchObject({
      page: 1,
      limit: LIMIT,
      sort: "-ratingsAverage",
      "ratingsAverage[gte]": 3.5,
    });
  });

  it("does not set onlyAvailable", () => {
    const p = new URLSearchParams("sort=soonest");
    const api = buildApiParamsFromExperiencesUrl(p, CATALOG, LIMIT);
    expect(api.onlyAvailable).toBeUndefined();
  });
});
