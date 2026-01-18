import { beforeAll, describe, expect, it } from "vitest";
import { RadnaMesta } from "../../src/models/radna_mesta.model";
import { getAllRadnaMesta } from "../../src/services/radna_mesta.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("radna_mesta.service", () => {
  beforeAll(async () => {
    await RadnaMesta.insertMany(staticTestData.radnaMesta);
  });
  describe("getAllRadnaMesta", () => {
    it("should return all radna_mesta sorted by radno_mesto", async () => {
      const result = await getAllRadnaMesta();

      expect(result).toHaveLength(TEST_DATA_CONFIG.RADNA_MESTA.length);
      expect(result).toEqual(TEST_DATA_CONFIG.RADNA_MESTA.toSorted());
    });
  });
});
