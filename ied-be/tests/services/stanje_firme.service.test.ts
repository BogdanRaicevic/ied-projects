import { beforeAll, describe, expect, it } from "vitest";
import { StanjeFirme } from "../../src/models/stanje_firme.model";
import { getAllStanjaFirmi } from "../../src/services/stanje_firme.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("stanje_firme.service", () => {
  beforeAll(async () => {
    await StanjeFirme.insertMany(staticTestData.stanjaFirme);
  });

  describe("getAllStanjaFirmi", () => {
    it("should return all stanja_firme", async () => {
      const result = await getAllStanjaFirmi();

      expect(result).toHaveLength(TEST_DATA_CONFIG.STANJE_FIRME.length);
      expect(result).toEqual(TEST_DATA_CONFIG.STANJE_FIRME.toSorted());
    });
  });
});
