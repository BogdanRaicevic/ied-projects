import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";
import { Pretrage } from "../../src/models/pretrage.model";
import { savePretraga } from "../../src/services/pretrage.service";

// Mock the model to prevent actual DB calls
vi.mock("../../src/models/pretrage.model", () => ({
  Pretrage: {
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

describe("pretrage.service", () => {
  describe("savePretraga", () => {
    it("should save successfully with valid IDs", async () => {
      const validMestoId = new Types.ObjectId().toString();
      const validTipSeminaraId = new Types.ObjectId().toString();

      const queryParams = {
        mesta: [validMestoId],
        tipoviSeminara: [validTipSeminaraId],
      };
      const pretraga = { naziv: "Test Pretraga" };

      // Mock findOneAndUpdate to return null so it calls create
      vi.mocked(Pretrage.findOneAndUpdate).mockResolvedValueOnce(null);
      vi.mocked(Pretrage.create).mockResolvedValueOnce({} as any);

      await expect(
        savePretraga(queryParams as any, pretraga),
      ).resolves.not.toThrow();

      expect(Pretrage.findOneAndUpdate).toHaveBeenCalled();
      expect(Pretrage.create).toHaveBeenCalled();
    });

    it("should throw an error for invalid mesta IDs", async () => {
      const invalidMestoId = "invalid-mesto-id";
      const validTipSeminaraId = new Types.ObjectId().toString();

      const queryParams = {
        mesta: [invalidMestoId],
        tipoviSeminara: [validTipSeminaraId],
      };
      const pretraga = { naziv: "Test Pretraga" };

      await expect(savePretraga(queryParams as any, pretraga)).rejects.toThrow(
        `Invalid mesta IDs: ${invalidMestoId}`,
      );
    });

    it("should throw an error for invalid tipoviSeminara IDs", async () => {
      const validMestoId = new Types.ObjectId().toString();
      const invalidTipSeminaraId = "invalid-tip-seminara-id";

      const queryParams = {
        mesta: [validMestoId],
        tipoviSeminara: [invalidTipSeminaraId],
      };
      const pretraga = { naziv: "Test Pretraga" };

      await expect(savePretraga(queryParams as any, pretraga)).rejects.toThrow(
        `Invalid tipoviSeminara IDs: ${invalidTipSeminaraId}`,
      );
    });

    it("should throw an error if multiple invalid IDs are provided", async () => {
      const invalidMestoId1 = "invalid-mesto-1";
      const invalidMestoId2 = "invalid-mesto-2";

      const queryParams = {
        mesta: [invalidMestoId1, invalidMestoId2],
      };
      const pretraga = { naziv: "Test Pretraga" };

      await expect(savePretraga(queryParams as any, pretraga)).rejects.toThrow(
        `Invalid mesta IDs: ${invalidMestoId1}, ${invalidMestoId2}`,
      );
    });
  });
});
