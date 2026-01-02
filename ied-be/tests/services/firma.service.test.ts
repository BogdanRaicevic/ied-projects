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
} from "../utils/seedData";

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
});
