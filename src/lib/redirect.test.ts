import { describe, it, expect, beforeEach } from "vitest";
import {
  consumeOAuthRedirect,
  isSafeInternalPath,
  resolveFrom,
  saveOAuthRedirect,
} from "./redirect";

describe("redirect helpers", () => {
  beforeEach(() => sessionStorage.clear());

  it("only allows internal paths", () => {
    expect(isSafeInternalPath("/host/wallet?x=1")).toBe(true);
    expect(isSafeInternalPath("/" + String.fromCharCode(92) + "evil.com")).toBe(false);
    expect(isSafeInternalPath("/" + String.fromCharCode(92) + "evil.com")).toBe(false);
    expect(isSafeInternalPath("/\t/evil.com")).toBe(false);
    expect(isSafeInternalPath("/\n/evil.com")).toBe(false);
    expect(isSafeInternalPath("https://evil.com")).toBe(false);
    expect(isSafeInternalPath("javascript:alert(1)")).toBe(false);
    expect(isSafeInternalPath(undefined)).toBe(false);
  });

  it("resolves from strings and location objects, defaulting to /", () => {
    expect(resolveFrom({ from: "/my-bookings" })).toBe("/my-bookings");
    expect(resolveFrom({ from: { pathname: "/a", search: "?b=1" } })).toBe("/a?b=1");
    expect(resolveFrom({ from: "//evil.com" })).toBe("/");
    expect(resolveFrom(null)).toBe("/");
  });

  it("persists the OAuth target once", () => {
    saveOAuthRedirect("/host/wallet");
    expect(consumeOAuthRedirect()).toBe("/host/wallet");
    expect(consumeOAuthRedirect()).toBe("/");
    saveOAuthRedirect("//evil.com");
    expect(consumeOAuthRedirect()).toBe("/");
  });
});
