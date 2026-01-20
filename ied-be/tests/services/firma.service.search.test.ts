import { type ParametriPretrage, PRIJAVA_STATUS } from "ied-shared";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Firma } from "../../src/models/firma.model";
import { Seminar } from "../../src/models/seminar.model";
import { TipSeminara } from "../../src/models/tip_seminara.model";
import * as firmaService from "../../src/services/firma.service";
import staticTestData from "../fixtures/staticTestData.json";

vi.mock("../../src/services/email_suppression.service", () => ({
  isEmailSuppressed: vi.fn().mockResolvedValue(false),
}));

describe("firma.service search", () => {
  beforeAll(async () => {
    // Load static data into the database
    await TipSeminara.insertMany(staticTestData.tipoviSeminara);
    await Firma.insertMany(staticTestData.firme);
    await Seminar.insertMany(staticTestData.seminari);
  });

  describe("simple search over FIRMA", () => {
    it("should find ALL firmas, no filters", async () => {
      const result = await firmaService.search({});
      expect(result.totalDocuments).toBe(staticTestData.firme.length);
    });

    it("should filter by MESTA", async () => {
      const queryParameters: ParametriPretrage = { mesta: ["Beograd"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(staticTestData.firme.length);
    });

    it("should filter by DELATNOSTI", async () => {
      const queryParameters: ParametriPretrage = { delatnosti: ["IT"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(staticTestData.firme.length);
    });

    it("should filter by TIPOVI FIRME", async () => {
      const queryParameters: ParametriPretrage = { tipoviFirme: ["DOO"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(staticTestData.firme.length);
    });

    it("should filter by VELICINE FIRMI", async () => {
      const queryParameters: ParametriPretrage = { velicineFirme: ["mala"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(staticTestData.firme.length);
    });

    it("should filter by STANJA FIRME", async () => {
      const queryParameters: ParametriPretrage = { stanjaFirme: ["aktivna"] };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(staticTestData.firme.length);
    });

    it("should filter by PRIJAVLJENI status", async () => {
      const result = await firmaService.search({
        firmaPrijavljeni: PRIJAVA_STATUS.subscribed,
      });

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(staticTestData.firme.length);
    });

    it("should search by text in NAZIV FIRME", async () => {
      const queryParameters: ParametriPretrage = { imeFirme: "as" };
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(staticTestData.firme.length);
    });
  });

  describe("Zaposleni related search", () => {
    it("should filter by RADNA MESTA", async () => {
      const queryParameters: ParametriPretrage = {
        radnaMesta: ["Developer"],
      };

      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(staticTestData.firme.length);
    });

    it("should find firmas where zaposleni match criteria", async () => {
      const queryParameters: ParametriPretrage = {
        radnaMesta: ["Developer"],
        imePrezime: "Al",
      };

      const result = await firmaService.search(queryParameters);

      // Count expected results from static data
      const expectedCount = staticTestData.firme.filter((firma) =>
        firma.zaposleni?.some(
          (z) =>
            z.radno_mesto === "Developer" &&
            (z.ime.startsWith("Al") || z.prezime.startsWith("Al")),
        ),
      ).length;

      expect(result.totalDocuments).toBe(expectedCount);
    });
  });

  describe("complex combined filters", () => {
    it("should combine multiple filters", async () => {
      const queryParameters: ParametriPretrage = {
        mesta: ["Beograd"],
        delatnosti: ["IT"],
        tipoviFirme: ["JP"],
      };

      const result = await firmaService.search(queryParameters);
      expect(result.totalDocuments).toBe(1);
    });

    it("should combine seminar filter with firma filters", async () => {
      const seminarId = staticTestData.seminari[0]!._id.toString();
      const queryParameters: ParametriPretrage = {
        seminari: [seminarId],
        tipoviFirme: ["DOO", "AD"],
        stanjaFirme: ["aktivna"],
      };

      const result = await firmaService.search(queryParameters);
      expect(result.totalDocuments).toBe(1);
    });
  });

  describe("seminar-related search with seeded data", () => {
    const seminarId = staticTestData.seminari[0]!._id.toString();
    it("should filter by SEMINARI - firmas with prijave on specific seminar", async () => {
      const queryParameters: ParametriPretrage = {
        seminari: [seminarId],
      };

      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBe(5);
    });

    it("should filter by multiple SEMINARI", async () => {
      const seminarIds = staticTestData.seminari
        .slice(0, 3)
        .map((s) => s._id.toString());
      const queryParameters: ParametriPretrage = { seminari: seminarIds };

      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBeGreaterThan(0);
    });

    it("should filter by TIP_SEMINARA", async () => {
      const tipSeminaraId =
        staticTestData.tipoviSeminara[0]?._id.toString() || "";
      const queryParameters: ParametriPretrage = {
        tipoviSeminara: [tipSeminaraId],
      };

      const result = await firmaService.search(queryParameters);

      // Should find firmas that have prijave on seminars of this type
      expect(result.totalDocuments).toBeGreaterThan(0);
    });

    it("should return 0 results for non-existent seminar", async () => {
      const fakeId = "612e3c4f1c4ae5b6f0d9f999";
      const queryParameters: ParametriPretrage = { seminari: [fakeId] };

      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBe(0);
    });

    it("should combine SEMINARI filter with other filters", async () => {
      const queryParameters: ParametriPretrage = {
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
});
