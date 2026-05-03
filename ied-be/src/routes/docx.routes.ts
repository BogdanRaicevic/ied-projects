import { type Request, Router } from "express";
import {
  type RacunType,
  RacunZod,
  SertifikatBatchZod,
  type SertifikatType,
  TipRacuna,
} from "ied-shared";
import { validateRequestBody } from "../middleware/validateSchema";
import {
  generateCertificatesZipBuffer,
  generateDocxBuffer,
} from "../services/docx.service";
import { getTemplateErrorDetails } from "../utils/docx.utils";

const router = Router();

router.post(
  "/modify-template",
  validateRequestBody(RacunZod),
  async (req: Request<{}, any, RacunType>, res) => {
    const { tipRacuna } = req.body;

    if (!Object.values(TipRacuna).includes(tipRacuna as TipRacuna)) {
      res.status(400).json({
        error: "Invalid template name",
        validTypes: Object.values(TipRacuna),
      });
      return;
    }

    try {
      const { buffer, fileName } = generateDocxBuffer(tipRacuna, req.body);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.send(buffer);
    } catch (error) {
      console.error("Template processing error:", error);
      res.status(500).json({
        error: "Error processing template",
        details: getTemplateErrorDetails(error),
      });
    }
  },
);

router.post(
  "/generate-pdf-files",
  validateRequestBody(SertifikatBatchZod),
  async (req: Request<{}, any, SertifikatType[]>, res) => {
    try {
      const { buffer, fileName } = await generateCertificatesZipBuffer(
        req.body,
      );
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.send(buffer);
    } catch (error) {
      console.error("PDF certificate generation error:", error);
      res.status(500).json({
        error: "Error generating PDF certificates",
        details: getTemplateErrorDetails(error),
      });
    }
  },
);

export default router;
