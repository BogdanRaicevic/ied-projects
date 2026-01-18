import { beforeAll, describe, expect, it } from "vitest";
import { Delatnost } from "../../src/models/delatnosti.model";
import { getAllDelatnosti } from "../../src/services/delatnost.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("delatnost.service", () => {
  beforeAll(async () => {
    await Delatnost.insertMany(staticTestData.delatnosti);
  });

  describe("getAllDelatnosti", () => {
    it("should return all delatnosti sorted by delatnost", async () => {
      const result = await getAllDelatnosti();

      expect(result.length).toBe(TEST_DATA_CONFIG.DELATNOSTI.length);
      expect(result).toEqual(TEST_DATA_CONFIG.DELATNOSTI.toSorted());
    });
  });
});
