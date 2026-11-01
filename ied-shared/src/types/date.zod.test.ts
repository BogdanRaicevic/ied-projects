import { describe, expect, it } from "vitest";
import { zDate, zOptionalDate } from "./date.zod";

describe("zDate", () => {
  it("parses ISO strings and Dates", () => {
    const iso = "2026-01-02T00:00:00.000Z";
    expect(zDate().parse(iso)).toEqual(new Date(iso));
    expect(zDate().parse(new Date(iso))).toEqual(new Date(iso));
  });

  it("rejects null and empty instead of returning 1970-01-01", () => {
    expect(zDate().safeParse(null).success).toBe(false);
    expect(zDate().safeParse("").success).toBe(false);
    expect(zDate().safeParse("not a date").success).toBe(false);
  });

  it("uses the custom message", () => {
    const result = zDate("Datum je obavezan").safeParse(null);
    expect(result.error?.issues[0]?.message).toBe("Datum je obavezan");
  });
});

describe("zOptionalDate", () => {
  it("treats null, empty and missing as undefined", () => {
    expect(zOptionalDate().parse(null)).toBeUndefined();
    expect(zOptionalDate().parse("")).toBeUndefined();
    expect(zOptionalDate().parse(undefined)).toBeUndefined();
  });

  it("still rejects garbage", () => {
    expect(zOptionalDate().safeParse("not a date").success).toBe(false);
  });
});
