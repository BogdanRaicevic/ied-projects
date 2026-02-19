import { beforeAll, describe, expect, it } from "vitest";
import { Mesto } from "../../src/models/mesto.model";
import { getMestaNames } from "../../src/services/mesto.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("mesta.service", () => {
  beforeAll(async () => {
    await Mesto.insertMany(staticTestData.mesta);
  });

  describe("getAllMesta", () => {
    it("should return all mesta sorted by naziv_mesto", async () => {
      const result = await getMestaNames();

      expect(result).toHaveLength(TEST_DATA_CONFIG.MESTA.length);
      expect(result).toEqual(TEST_DATA_CONFIG.MESTA.toSorted());
    });
  });
});
