import { beforeAll, describe, expect, it } from "vitest";
import { TipSeminara } from "../../src/models/tip_seminara.model";
import { getAllTipSeminara } from "../../src/services/tip_seminara.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("tip_seminara.service", () => {
  beforeAll(async () => {
    await TipSeminara.insertMany(staticTestData.tipoviSeminara);
  });

  describe("getAllTipSeminara", () => {
    it("should return all tipovi_seminara", async () => {
      const result = await getAllTipSeminara();

      expect(result).toHaveLength(TEST_DATA_CONFIG.TIP_SEMINARA.length);
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
});
