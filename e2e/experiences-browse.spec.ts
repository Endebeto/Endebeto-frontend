import { test, expect } from "@playwright/test";

const API_ORIGIN = "http://localhost:3000";

const boundsJson = JSON.stringify({
  status: "success",
  data: { data: { minPrice: 0, maxPrice: 8_000 } },
});

const emptyListJson = JSON.stringify({
  status: "success",
  results: 0,
  data: { data: [] },
});

test.describe("Experiences browse: URL and API query strings", () => {
  test("loads with ?sort&page and requests matching /experiences params", async ({ page }) => {
    const listRequests: string[] = [];

    await page.route(
      (url) => {
        const p = new URL(url);
        return (
          p.origin === API_ORIGIN && p.pathname === "/api/v1/experiences/catalog-price-bounds"
        );
      },
      (route) => {
        void route.fulfill({
          status: 200,
          contentType: "application/json",
          body: boundsJson,
        });
      },
    );

    await page.route(
      (url) => {
        const p = new URL(url);
        return p.origin === API_ORIGIN && p.pathname === "/api/v1/experiences";
      },
      (route) => {
        listRequests.push(route.request().url());
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: emptyListJson,
        });
      },
    );

    const qs = "page=2&sort=price-asc";
    await page.goto(`/experiences?${qs}`);

    await expect.poll(() => listRequests.length).toBeGreaterThan(0);
    const u = new URL(
      listRequests.find((r) => new URL(r).searchParams.get("page") === "2") ?? listRequests.at(-1)!,
    );
    expect(u.searchParams.get("page")).toBe("2");
    expect(u.searchParams.get("sort")).toBe("price");
    expect(u.searchParams.get("limit")).toBe("10");
    expect(u.searchParams.get("onlyAvailable")).toBeNull();

    const bar = new URL(page.url());
    expect(bar.searchParams.get("page")).toBe("2");
    expect(bar.searchParams.get("sort")).toBe("price-asc");
  });

  test("deep link with q= and rating= is reflected in the list API", async ({ page }) => {
    const listRequests: string[] = [];

    await page.route(
      (url) => {
        const p = new URL(url);
        return (
          p.origin === API_ORIGIN && p.pathname === "/api/v1/experiences/catalog-price-bounds"
        );
      },
      (route) => {
        void route.fulfill({
          status: 200,
          contentType: "application/json",
          body: boundsJson,
        });
      },
    );

    await page.route(
      (url) => {
        const p = new URL(url);
        return p.origin === API_ORIGIN && p.pathname === "/api/v1/experiences";
      },
      (route) => {
        listRequests.push(route.request().url());
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: emptyListJson,
        });
      },
    );

    const qs = "q=addis&rating=4.5&sort=soonest";
    await page.goto(`/experiences?${qs}`);

    await expect.poll(() => listRequests.length).toBeGreaterThan(0);
    const u = new URL(listRequests.at(-1)!);
    expect(u.searchParams.get("q")).toBe("addis");
    expect(u.searchParams.get("ratingsAverage[gte]")).toBe("4.5");
    expect(u.searchParams.get("sort")).toBe("nextOccurrenceAt");
  });
});
