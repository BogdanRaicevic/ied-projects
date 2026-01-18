import { beforeAll, describe, expect, it } from "vitest";
import { TipFirme } from "../../src/models/tip_firme.model";
import { getAllTipoviFirme } from "../../src/services/tip_firme.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("tip_firme.service", () => {
  beforeAll(async () => {
    await TipFirme.insertMany(staticTestData.tipoviFirme);
  });
  describe("getAllTipoviFirme", () => {
    it("should return all tipovi_firme sorted by tip_firme", async () => {
      const result = await getAllTipoviFirme();

      expect(result).toHaveLength(TEST_DATA_CONFIG.TIP_FIRME.length);
      expect(result).toEqual(TEST_DATA_CONFIG.TIP_FIRME.toSorted());
    });
  });
});
