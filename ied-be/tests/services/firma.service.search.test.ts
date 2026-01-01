import type { FirmaQueryParams } from "@ied-shared/types/firma.zod";
import { beforeAll, describe, expect, it, vi } from "vitest";
import * as firmaService from "../../src/services/firma.service";
import { seedTestDatabase, TEST_DATA_CONFIG } from "../seedData";

vi.mock("../../src/services/email_suppression.service", () => ({
  isEmailSuppressed: vi.fn().mockResolvedValue(false),
}));

describe("firma.service search", () => {
  let seededData: Awaited<ReturnType<typeof seedTestDatabase>>;

  beforeAll(async () => {
    seededData = await seedTestDatabase();
  });

  describe("simple search over FIRMA", () => {
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
  });

  describe("Zaposleni related search", () => {
    it("should filter by RADNA MESTA", async () => {
      const queryParameters: FirmaQueryParams = {
        radnaMesta: ["Developer"],
      };

      const result = await firmaService.search(queryParameters);
      console.log("Result:", result.totalDocuments);

      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.totalDocuments).toBeLessThan(TEST_DATA_CONFIG.FIRMAS_COUNT);
    });

    it("should find firmas where DIFFERENT zaposleni match DIFFERENT criteria", async () => {
      const queryParameters: FirmaQueryParams = {
        radnaMesta: ["Developer"],
        imePrezime: "Al",
      };

      console.log("seededData.firme:", seededData.firme.length);
      const result = await firmaService.search(queryParameters);

      expect(result.totalDocuments).toBe(1);
    });
  });
});
