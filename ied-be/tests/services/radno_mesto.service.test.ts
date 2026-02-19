import { beforeAll, describe, expect, it } from "vitest";
import { RadnoMesto } from "../../src/models/radno_mesto.model";
import { getAllRadnaMestaNames } from "../../src/services/radno_mesto.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("radna_mesta.service", () => {
  beforeAll(async () => {
    await RadnoMesto.insertMany(staticTestData.radnaMesta);
  });
  describe("getAllRadnaMesta", () => {
    it("should return all radna_mesta sorted by radno_mesto", async () => {
      const result = await getAllRadnaMestaNames();

      expect(result).toHaveLength(TEST_DATA_CONFIG.RADNA_MESTA.length);
      expect(result).toEqual(TEST_DATA_CONFIG.RADNA_MESTA.toSorted());
    });
  });
});
