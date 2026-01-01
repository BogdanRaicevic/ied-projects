import type { FirmaQueryParams } from "@ied-shared/types/firma.zod";
import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FirmaType } from "../../src/models/firma.model";
import type { SeminarType } from "../../src/models/seminar.model";
import * as firmaService from "../../src/services/firma.service";
import {
  cursorToArray,
  type SeededData,
  seedTestDatabase,
  TEST_DATA_CONFIG,
} from "../seedData";

vi.mock("../../src/services/email_suppression.service", () => ({
  isEmailSuppressed: vi.fn().mockResolvedValue(false),
}));

describe("firma.service", () => {
  const sampleFirmaData = {
    naziv_firme: "Test Firma d.o.o.",
    adresa: "Testna ulica 123",
    PIB: "123456789",
    telefon: "011-123-456",
    e_mail: "test@firma.rs",
    mesto: "Beograd",
    tip_firme: "DOO",
    delatnost: "IT",
    velicina_firme: "mala",
    stanje_firme: "aktivna",
    prijavljeni: true,
  };

  describe("create", () => {
    it("should create a new firma", async () => {
      const result = await firmaService.create(sampleFirmaData);

      expect(result).toBeDefined();
      expect(result.naziv_firme).toBe(sampleFirmaData.naziv_firme);
      expect(result.e_mail).toBe(sampleFirmaData.e_mail);
      expect(result.PIB).toBe(sampleFirmaData.PIB);
      expect(result._id).toBeDefined();
    });

    it("should persist firma to database", async () => {
      const created = await firmaService.create(sampleFirmaData);

      const found = await firmaService.findById(created._id.toString());
      expect(found).toBeDefined();
      expect(found?.naziv_firme).toBe(sampleFirmaData.naziv_firme);
    });
  });

  describe("findById", () => {
    it("should find firma by id", async () => {
      const created = await firmaService.create(sampleFirmaData);
      const found = await firmaService.findById(created._id.toString());

      expect(found).toBeDefined();
      expect(found?.naziv_firme).toBe(sampleFirmaData.naziv_firme);
    });

    it("should return null for non-existent id", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const found = await firmaService.findById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe("updateById", () => {
    it("should update firma fields", async () => {
      const created = await firmaService.create(sampleFirmaData);

      const updated = await firmaService.updateById(created._id.toString(), {
        naziv_firme: "Updated Firma Name",
        telefon: "011-999-999",
      });

      expect(updated).toBeDefined();
      expect(updated?.naziv_firme).toBe("Updated Firma Name");
      expect(updated?.telefon).toBe("011-999-999");
      // Other fields should remain unchanged
      expect(updated?.e_mail).toBe(sampleFirmaData.e_mail);
    });

    it("should return null for non-existent id", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updated = await firmaService.updateById(fakeId, {
        naziv_firme: "Updated",
      });

      expect(updated).toBeNull();
    });
  });

  describe("deleteById", () => {
    it("should delete firma by id", async () => {
      const created = await firmaService.create(sampleFirmaData);
      const deleted = await firmaService.deleteById(created._id.toString());

      expect(deleted).toBeDefined();
      expect(deleted?._id.toString()).toBe(created._id.toString());

      // Verify it's actually deleted
      const found = await firmaService.findById(created._id.toString());
      expect(found).toBeNull();
    });

    it("should return null for non-existent id", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const deleted = await firmaService.deleteById(fakeId);

      expect(deleted).toBeNull();
    });
  });

  describe("createZaposleni", () => {
    it("should add zaposleni to firma", async () => {
      const firma = await firmaService.create(sampleFirmaData);

      const zaposleniData = {
        ime: "Petar",
        prezime: "Petrovic",
        radno_mesto: "Developer",
        telefon: "064-123-456",
        e_mail: "petar@firma.rs",
        prijavljeni: true,
      };

      const updated = await firmaService.createZaposleni(
        firma._id.toString(),
        zaposleniData as any,
      );

      expect(updated).toBeDefined();
      expect(updated?.zaposleni).toHaveLength(1);
      expect(updated?.zaposleni[0]?.ime).toBe("Petar");
      expect(updated?.zaposleni[0]?.prezime).toBe("Petrovic");
    });

    it("should set radno_mesto to 'nema' if empty string", async () => {
      const firma = await firmaService.create(sampleFirmaData);

      const zaposleniData = {
        ime: "Marko",
        prezime: "Markovic",
        radno_mesto: "",
        telefon: "064-111-222",
        e_mail: "marko@firma.rs",
        prijavljeni: true,
      };

      const updated = await firmaService.createZaposleni(
        firma._id.toString(),
        zaposleniData as any,
      );

      expect(updated?.zaposleni[0]?.radno_mesto).toBe("nema");
    });
  });

  describe("deleteZaposleni", () => {
    it("should remove zaposleni from firma", async () => {
      const firma = await firmaService.create(sampleFirmaData);

      const zaposleniData = {
        ime: "Jovan",
        prezime: "Jovanovic",
        radno_mesto: "Manager",
        telefon: "064-333-444",
        e_mail: "jovan@firma.rs",
        prijavljeni: true,
      };

      const withZaposleni = await firmaService.createZaposleni(
        firma._id.toString(),
        zaposleniData as any,
      );

      const zaposleniId = withZaposleni?.zaposleni[0]?._id.toString();

      const afterDelete = await firmaService.deleteZaposleni(
        firma._id.toString(),
        zaposleniId!,
      );

      expect(afterDelete?.zaposleni).toHaveLength(0);
    });
  });

  describe("simple search over FIRMA", () => {
    beforeEach(async () => {
      await seedTestDatabase();
    });

    it("should find ALL firmas, no filters", async () => {
      const result = await firmaService.search({});

      expect(result.totalDocuments).toBe(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should filter by MESTA", async () => {
      const queryParameters: FirmaQueryParams = { mesta: ["Beograd"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should filter by DELATNOSTI", async () => {
      const queryParameters: FirmaQueryParams = { delatnosti: ["IT"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should filter by TIPOVI FIRME", async () => {
      const queryParameters: FirmaQueryParams = { tipoviFirme: ["DOO"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should filter by VELICINE FIRMI", async () => {
      const queryParameters: FirmaQueryParams = { velicineFirmi: ["mala"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should filter by STANJA FIRME", async () => {
      const queryParameters: FirmaQueryParams = { stanjaFirme: ["aktivna"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      console.log(result.totalDocuments);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should filter by PRIJAVLJENI status", async () => {
      const result = await firmaService.search({ firmaPrijavljeni: true });

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should search by text in NAZIV FIRME", async () => {
      const queryParameters: FirmaQueryParams = { imeFirme: "as" };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should filter by RADNA MESTA", async () => {
      const queryParameters: FirmaQueryParams = {
        radnaMesta: ["Developer"],
      };

      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });
  });

  describe("seminar-related search with seeded data", () => {
    let seededData: SeededData;
    let seminar: SeminarType & { _id: mongoose.Types.ObjectId };
    let seminarId: string;

    beforeEach(async () => {
      seededData = await seedTestDatabase();
      if (seededData.seminari[0]) {
        seminar = seededData.seminari[0];
        seminarId = seminar._id.toString();
      } else {
        throw new Error("No seminars found in seeded data");
      }
    });

    it("should filter by SEMINARI - firmas with prijave on specific seminar", async () => {
      const queryParameters: FirmaQueryParams = {
        seminari: [seminarId],
      };

      const result = await firmaService.search(queryParameters);

      // Should find some firmas (those with prijave on this seminar)
      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);

      // Verify returned firmas actually have prijave on this seminar
      const firmas = await cursorToArray<FirmaType>(result.cursor);
      const firmaIdsInSeminar = new Set(
        seminar.prijave.map((p) => p.firma_id.toString()),
      );

      for (const firma of firmas) {
        expect(firmaIdsInSeminar.has(firma._id.toString())).toBe(true);
      }
    });

    it("should filter by multiple SEMINARI", async () => {
      const seminarIds = seededData.seminari
        .slice(0, 3)
        .map((s) => s._id.toString());
      const queryParameters: FirmaQueryParams = { seminari: seminarIds };

      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
    });

    it("should filter by TIP_SEMINARA", async () => {
      const tipSeminaraId = seededData?.tipoviSeminara[0]?._id.toString() || "";
      const queryParameters: FirmaQueryParams = {
        tipSeminara: [tipSeminaraId],
      };

      const result = await firmaService.search(queryParameters);

      // Should find firmas that have prijave on seminars of this type
      expect(result.totalDocuments).toBeGreaterThan(0);
    });

    it("should return 0 results for non-existent seminar", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const queryParameters: FirmaQueryParams = { seminari: [fakeId] };

      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBe(0);
    });

    it("should combine SEMINARI filter with other filters", async () => {
      const queryParameters: FirmaQueryParams = {
        seminari: [seminarId],
        mesta: ["Beograd"],
      };

      const result = await firmaService.search(queryParameters);

      // Result should be subset of seminar-only filter
      const seminarOnlyResult = await firmaService.search({
        seminari: [seminarId],
      });

      expect(result.totalDocuments).toBeLessThanOrEqual(
        seminarOnlyResult.totalDocuments,
      );
    });
  });

  describe("complex combined filters with seeded data", () => {
    let seededData: SeededData;
    let seminar: SeminarType & { _id: mongoose.Types.ObjectId };
    let seminarId: string;

    beforeEach(async () => {
      seededData = await seedTestDatabase();
      if (seededData.seminari[0]) {
        seminar = seededData.seminari[0];
        seminarId = seminar._id.toString();
      } else {
        throw new Error("No seminars found in seeded data");
      }
    });

    it("should combine multiple simple filters", async () => {
      const queryParameters: FirmaQueryParams = {
        mesta: ["Beograd"],
        delatnosti: ["IT"],
        tipoviFirme: ["DOO"],
      };

      const result = await firmaService.search(queryParameters);

      // Verify all returned firmas match all criteria
      const firmas = await cursorToArray<FirmaType>(result.cursor);
      for (const firma of firmas) {
        expect(firma.mesto).toBe("Beograd");
        expect(firma.delatnost).toBe("IT");
        expect(firma.tip_firme).toBe("DOO");
      }
    });

    it("should combine seminar filter with firma filters", async () => {
      const queryParameters: FirmaQueryParams = {
        seminari: [seminarId],
        tipoviFirme: ["DOO", "AD"],
        stanjaFirme: ["aktivna"],
      };

      const result = await firmaService.search(queryParameters);

      const firmas = await cursorToArray<FirmaType>(result.cursor);
      for (const firma of firmas) {
        expect(["DOO", "AD"]).toContain(firma.tip_firme);
        expect(firma.stanje_firme).toBe("aktivna");
      }
    });
  });
});
