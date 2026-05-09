import { test, expect } from "@playwright/test";

const API_ORIGIN = "http://localhost:3000";

const boundsJson = JSON.stringify({
  status: "success",
  data: { data: { minPrice: 0, maxPrice: 8_000 } },
});

const emptyExperiencesJson = JSON.stringify({
  status: "success",
  results: 0,
  total: 0,
  page: 1,
  limit: 10,
  pages: 1,
  data: [],
});

const emptyFeaturedJson = JSON.stringify({
  status: "success",
  results: 0,
  total: 0,
  page: 1,
  limit: 16,
  pages: 1,
  data: [],
});

const meJson = (user: Record<string, unknown>) =>
  JSON.stringify({
    status: "success",
    data: { data: user },
  });

const emptyBookingsJson = JSON.stringify({
  status: "success",
  results: 0,
  total: 0,
  page: 1,
  limit: 20,
  pages: 1,
  data: [],
});

async function stubExperiencesListAndBounds(page: import("@playwright/test").Page) {
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
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: emptyExperiencesJson,
      });
    },
  );
}

test.describe("Smoke: core routes load", () => {
  test("home, login, experiences", async ({ page }) => {
    await page.route(
      (url) => {
        const p = new URL(url);
        return p.origin === API_ORIGIN && p.pathname === "/api/v1/experiences";
      },
      (route) => {
        void route.fulfill({
          status: 200,
          contentType: "application/json",
          body: emptyFeaturedJson,
        });
      },
    );

    await page.goto("/");
    await expect(page.getByRole("navigation")).toBeVisible();

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

    await stubExperiencesListAndBounds(page);
    await page.goto("/experiences");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Curated");
  });

  test("my-bookings with session stub (happy path shell)", async ({ page }) => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      name: "E2E User",
      email: "e2e-smoke@example.com",
      role: "user",
      hostStatus: "none",
    };

    await page.addInitScript((u) => {
      localStorage.setItem("user", JSON.stringify(u));
    }, user);

    await page.route(
      (url) => {
        const p = new URL(url);
        return p.origin === API_ORIGIN && p.pathname === "/api/v1/users/me";
      },
      (route) => {
        void route.fulfill({
          status: 200,
          contentType: "application/json",
          body: meJson(user),
        });
      },
    );

    await page.route(
      (url) => {
        const p = new URL(url);
        return p.origin === API_ORIGIN && p.pathname === "/api/v1/bookings/me";
      },
      (route) => {
        void route.fulfill({
          status: 200,
          contentType: "application/json",
          body: emptyBookingsJson,
        });
      },
    );

    await page.goto("/my-bookings");
    await expect(page.getByRole("heading", { name: "My Bookings" })).toBeVisible();
    await expect(page.getByText("You have no bookings yet.")).toBeVisible();
  });
});
