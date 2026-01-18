import { beforeAll, describe, expect, it } from "vitest";
import { VelicineFirmi } from "../../src/models/velicina_firme.model";
import { getAllVelicineFirmi } from "../../src/services/velicina_firme.service";
import staticTestData from "../fixtures/staticTestData.json";
import { TEST_DATA_CONFIG } from "../utils/seedData";

describe("velicina_firme.service", () => {
  beforeAll(async () => {
    await VelicineFirmi.insertMany(staticTestData.velicineFirme);
  });

  describe("getAllVelicineFirmi", () => {
    it("should return all velicine_firme sorted by velicina_firme", async () => {
      const result = await getAllVelicineFirmi();

      expect(result).toHaveLength(TEST_DATA_CONFIG.VELICINA_FIRME.length);
      expect(result).toEqual(TEST_DATA_CONFIG.VELICINA_FIRME.toSorted());
    });
  });
});
