import { describe, it, expect } from "vitest";
import { localDateInputInDays, toLocalDateInput, toLocalDateTimeInput } from "./localDate";

describe("localDate helpers", () => {
  // Built from local components, so the assertions hold in any test-runner zone.
  const earlyMorning = new Date(2027, 2, 9, 1, 30); // 9 Mar 2027 01:30 local

  it("formats the local calendar date, not the UTC one", () => {
    expect(toLocalDateInput(earlyMorning)).toBe("2027-03-09");
  });

  it("formats local date-time for datetime-local inputs", () => {
    expect(toLocalDateTimeInput(earlyMorning)).toBe("2027-03-09T01:30");
  });

  it("offsets by local calendar days across month ends", () => {
    expect(localDateInputInDays(1, new Date(2027, 0, 31, 23, 0))).toBe("2027-02-01");
    expect(localDateInputInDays(28, earlyMorning)).toBe("2027-04-06");
  });
});
