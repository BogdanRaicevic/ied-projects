import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { Firma } from "../../src/models/firma.model";
import { Seminar } from "../../src/models/seminar.model";
import { createPrijava } from "../../src/services/seminar.service";
import { ErrorWithCause } from "../../src/utils/customErrors";

// Regression coverage: createPrijava used to silently return null when the
// zaposleni was already registered, and the route responded with
// "201 Created" regardless — a false-positive success.
describe("seminar.service createPrijava", () => {
  let zaposleniId: Types.ObjectId;
  let firmaId: Types.ObjectId;
  let seminarId: string;

  beforeEach(async () => {
    zaposleniId = new Types.ObjectId();
    firmaId = new Types.ObjectId();

    await Firma.create({
      _id: firmaId,
      naziv_firme: "Test Firma",
      zaposleni: [
        {
          _id: zaposleniId,
          ime: "Marko",
          prezime: "Markovic",
          radno_mesto: "Developer",
        },
      ],
    });

    const seminar = await Seminar.create({
      naziv: "Test Seminar",
      prijave: [],
    });
    seminarId = seminar._id.toString();
  });

  const prijava = () => ({
    firma_id: firmaId.toString(),
    firma_naziv: "Test Firma",
    zaposleni_id: zaposleniId.toString(),
    prisustvo: "offline" as const,
    vrsta_prijave: "email" as const,
  });

  it("registers a zaposleni that isn't registered yet", async () => {
    const updated = await createPrijava(seminarId, prijava());

    expect(updated?.prijave).toHaveLength(1);
  });

  it("throws a duplicate ErrorWithCause instead of silently returning null", async () => {
    await createPrijava(seminarId, prijava());

    let error: unknown;
    try {
      await createPrijava(seminarId, prijava());
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(ErrorWithCause);
    expect((error as ErrorWithCause).code).toBe("duplicate");

    const seminar = await Seminar.findById(seminarId).lean();
    expect(seminar?.prijave).toHaveLength(1);
  });
});
