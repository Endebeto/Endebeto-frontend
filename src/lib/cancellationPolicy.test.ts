import { describe, it, expect } from "vitest";
import {
  cutoffLabel,
  freeCancelUntil,
  normalisePolicy,
  policySummary,
} from "./cancellationPolicy";

describe("cancellation policy helpers", () => {
  const session = new Date("2030-06-10T10:00:00.000Z");

  it("computes the cutoff for each preset (matches the backend)", () => {
    expect(freeCancelUntil("24h", session)?.toISOString()).toBe("2030-06-09T10:00:00.000Z");
    expect(freeCancelUntil("48h", session)?.toISOString()).toBe("2030-06-08T10:00:00.000Z");
    expect(freeCancelUntil("7d", session)?.toISOString()).toBe("2030-06-03T10:00:00.000Z");
    expect(freeCancelUntil("none", session)).toBeNull();
  });

  it("defaults unknown values to 24h", () => {
    expect(normalisePolicy(undefined)).toBe("24h");
    expect(normalisePolicy("3h")).toBe("24h");
    expect(policySummary(undefined)).toMatch(/24 hours/);
  });

  it("labels future cutoffs and treats passed or missing ones as no free cancellation", () => {
    const now = new Date("2030-06-01T00:00:00.000Z");
    expect(cutoffLabel(new Date("2030-06-09T10:00:00.000Z"), now)).toMatch(/^Free cancellation until /);
    expect(cutoffLabel(new Date("2030-05-30T10:00:00.000Z"), now)).toBe(
      "No free cancellation for this session",
    );
    expect(cutoffLabel(null, now)).toBe("No free cancellation for this session");
  });
});
