import { describe, expect, it } from "vitest";
import { toDateRangeFilter } from "../../src/utils/utils";

describe("toDateRangeFilter", () => {
  it("returns undefined when neither bound is given", () => {
    expect(toDateRangeFilter(undefined, undefined)).toBeUndefined();
  });

  it("sets only $gte when only 'from' is given", () => {
    const from = new Date("2026-08-10T00:00:00.000Z");

    expect(toDateRangeFilter(from, undefined)).toEqual({ $gte: from });
  });

  it("shifts 'to' to the exclusive start of the next day", () => {
    // A date-only picker sends midnight of the selected day.
    const to = new Date("2026-08-23T00:00:00.000Z");

    const range = toDateRangeFilter(undefined, to);

    expect(range).toEqual({ $lt: new Date("2026-08-24T00:00:00.000Z") });
  });

  it("includes a timestamp anywhere within the selected end day", () => {
    const to = new Date("2026-08-23T00:00:00.000Z");
    const upperBound = toDateRangeFilter(undefined, to)?.$lt as Date;

    const lateSameDay = new Date("2026-08-23T23:59:59.999Z");
    const nextDay = new Date("2026-08-24T00:00:00.000Z");

    expect(lateSameDay.getTime() < upperBound.getTime()).toBe(true);
    expect(nextDay.getTime() < upperBound.getTime()).toBe(false);
  });

  it("combines both bounds", () => {
    const from = new Date("2026-08-01T00:00:00.000Z");
    const to = new Date("2026-08-23T00:00:00.000Z");

    expect(toDateRangeFilter(from, to)).toEqual({
      $gte: from,
      $lt: new Date("2026-08-24T00:00:00.000Z"),
    });
  });
});
