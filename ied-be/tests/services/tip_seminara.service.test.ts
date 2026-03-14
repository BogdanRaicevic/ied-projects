import { Types } from "mongoose";
import { beforeAll, describe, expect, it } from "vitest";
import { TipSeminara } from "../../src/models/tip_seminara.model";
import {
  createTipSeminara,
  deleteTipSeminara,
  getAllTipSeminara,
  updateTipSeminara,
} from "../../src/services/tip_seminara.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("tip_seminara.service", () => {
  beforeAll(async () => {
    await TipSeminara.insertMany(staticTestData.tipoviSeminara);
  });

  describe("getAllTipSeminara", () => {
    it("should return all tipovi_seminara", async () => {
      const result = await getAllTipSeminara();

      expect(result.length).toBeGreaterThanOrEqual(
        TEST_DATA_CONFIG.TIP_SEMINARA.length,
      );
    });

    it("should return objects with _id and tipSeminara", async () => {
      const result = await getAllTipSeminara();

      result.forEach((item) => {
        expect(item).toHaveProperty("_id");
        expect(item).toHaveProperty("tipSeminara");
        expect(typeof item._id).toBe("string");
        expect(typeof item.tipSeminara).toBe("string");
      });
    });
  });

  describe("createTipSeminara", () => {
    it("should create a new tip_seminara", async () => {
      const newTip = { tipSeminara: "Novi Tip Seminara" };
      const result = await createTipSeminara(newTip);

      expect(result).toHaveProperty("_id");
      expect(result.tipSeminara).toBe(newTip.tipSeminara);

      const inDb = await TipSeminara.findById(result._id);
      expect(inDb).not.toBeNull();
      expect(inDb?.tipSeminara).toBe(newTip.tipSeminara);
    });
  });

  describe("updateTipSeminara", () => {
    it("should update an existing tip_seminara", async () => {
      // First create one to update
      const created = await createTipSeminara({ tipSeminara: "To Be Updated" });

      const updatedData = { tipSeminara: "Updated Tip Seminara" };
      const result = await updateTipSeminara(created._id, updatedData);

      expect(result._id).toBe(created._id);
      expect(result.tipSeminara).toBe(updatedData.tipSeminara);

      const inDb = await TipSeminara.findById(created._id);
      expect(inDb?.tipSeminara).toBe(updatedData.tipSeminara);
    });

    it("should throw an error if tip_seminara is not found", async () => {
      const fakeId = new Types.ObjectId().toString();
      await expect(
        updateTipSeminara(fakeId, { tipSeminara: "Does Not Matter" }),
      ).rejects.toThrow("Tip seminara not found");
    });
  });

  describe("deleteTipSeminara", () => {
    it("should delete an existing tip_seminara", async () => {
      // First create one to delete
      const created = await createTipSeminara({ tipSeminara: "To Be Deleted" });

      await deleteTipSeminara(created._id);

      const inDb = await TipSeminara.findById(created._id);
      expect(inDb).toBeNull();
    });
  });
});
