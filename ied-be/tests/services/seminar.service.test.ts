import { ExtendedSearchSeminarZod, SeminarSchema } from "ied-shared";
import { describe, expect, it } from "vitest";
import { Seminar } from "../../src/models/seminar.model";
import { createSeminar, searchSeminars } from "../../src/services/seminar.service";

describe("seminar.service multi-date (datumi)", () => {
  it("persists datumi independently from the legacy datum", async () => {
    const datum = new Date("2026-01-10T00:00:00.000Z");
    const datumi = [
      new Date("2026-01-11T00:00:00.000Z"),
      new Date("2026-01-12T00:00:00.000Z"),
    ];

    const created = await createSeminar(
      SeminarSchema.parse({ naziv: "Multi-day", datum, datumi }),
    );

    const inDb = await Seminar.findById(created._id).lean();
    expect(inDb?.datum?.toISOString()).toBe(datum.toISOString());
    expect((inDb?.datumi ?? []).map((d) => d.toISOString())).toEqual(
      datumi.map((d) => d.toISOString()),
    );
  });

  it("returns a seminar when any datumi date is in range (datum outside)", async () => {
    await createSeminar(
      SeminarSchema.parse({
        naziv: "datumi-in-range",
        datum: new Date("2030-05-01T00:00:00.000Z"),
        datumi: [new Date("2030-06-15T00:00:00.000Z")],
      }),
    );

    const res = await searchSeminars(
      ExtendedSearchSeminarZod.parse({
        datumOd: new Date("2030-06-01T00:00:00.000Z"),
        datumDo: new Date("2030-06-30T00:00:00.000Z"),
      }),
    );

    expect(res.seminari.some((s) => s.naziv === "datumi-in-range")).toBe(true);
  });

  it("still matches the legacy datum when datumi is empty", async () => {
    await createSeminar(
      SeminarSchema.parse({
        naziv: "legacy-datum",
        datum: new Date("2031-03-10T00:00:00.000Z"),
        datumi: [],
      }),
    );

    const res = await searchSeminars(
      ExtendedSearchSeminarZod.parse({
        datumOd: new Date("2031-03-01T00:00:00.000Z"),
        datumDo: new Date("2031-03-31T00:00:00.000Z"),
      }),
    );

    expect(res.seminari.some((s) => s.naziv === "legacy-datum")).toBe(true);
  });

  it("excludes a seminar whose dates are all outside the range", async () => {
    await createSeminar(
      SeminarSchema.parse({
        naziv: "out-of-range",
        datum: new Date("2032-01-01T00:00:00.000Z"),
        datumi: [new Date("2032-02-01T00:00:00.000Z")],
      }),
    );

    const res = await searchSeminars(
      ExtendedSearchSeminarZod.parse({
        datumOd: new Date("2033-01-01T00:00:00.000Z"),
        datumDo: new Date("2033-12-31T00:00:00.000Z"),
      }),
    );

    expect(res.seminari.some((s) => s.naziv === "out-of-range")).toBe(false);
  });
});
