import { describe, expect, it } from "vitest";
import { SeminarSchema } from "./seminar.zod";

const seminar = { naziv: "Seminar", datumi: ["2026-01-15T00:00:00.000Z"] };

describe("SeminarSchema prices", () => {
  it("rejects an emptied price (null) instead of coercing to 0", () => {
    const result = SeminarSchema.safeParse({ ...seminar, onlineCena: null });
    expect(result.error?.issues[0]?.message).toBe("Cena je obavezna");
  });

  it("defaults a missing price to 0", () => {
    expect(SeminarSchema.parse(seminar).offlineCena).toBe(0);
  });
});
