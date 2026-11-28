import { describe, it, expect } from "vitest";
import { metaForPath } from "./RouteMeta";

describe("metaForPath (P2-23)", () => {
  it("indexes public pages with their own titles", () => {
    expect(metaForPath("/").noindex).toBeUndefined();
    expect(metaForPath("/experiences").title).toMatch(/^Experiences/);
    expect(metaForPath("/experiences/abc123").noindex).toBeUndefined();
  });

  it("noindexes account, host, admin and auth pages", () => {
    for (const p of [
      "/admin/payouts",
      "/host/wallet",
      "/host-dashboard",
      "/profile",
      "/my-bookings",
      "/login",
      "/reset-password/tok",
    ]) {
      expect(metaForPath(p).noindex).toBe(true);
    }
  });

  it("noindexes unknown routes (404s)", () => {
    expect(metaForPath("/no-such-page").noindex).toBe(true);
  });
});
