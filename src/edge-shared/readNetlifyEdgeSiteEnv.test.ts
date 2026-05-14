import { afterEach, describe, expect, it } from "vitest";
import { readSiteEnvForEdgeFn } from "./readNetlifyEdgeSiteEnv";

describe("readSiteEnvForEdgeFn", () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "Netlify");
    Reflect.deleteProperty(globalThis, "Deno");
  });

  it("prefers trimmed Netlify.env when defined", () => {
    Reflect.set(globalThis, "Netlify", {
      env: {
        get(k: string) {
          return k === "FOO" ? "  bar\n" : "";
        },
      },
    });
    Reflect.set(globalThis, "Deno", {
      env: {
        get() {
          return "wrong";
        },
      },
    });
    expect(readSiteEnvForEdgeFn("FOO")).toBe("bar");
  });

  it("falls back to Deno.env when Netlify missing", () => {
    Reflect.set(globalThis, "Deno", {
      env: {
        get(k: string) {
          return k === "BAR" ? "baz" : undefined;
        },
      },
    });
    expect(readSiteEnvForEdgeFn("BAR")).toBe("baz");
  });

  it("returns undefined for empty vars", () => {
    Reflect.set(globalThis, "Netlify", {
      env: { get: () => "   " },
    });
    expect(readSiteEnvForEdgeFn("X")).toBeUndefined();
  });
});
