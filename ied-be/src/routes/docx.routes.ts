import { type Request, Router } from "express";
import {
  type RacunType,
  RacunZod,
  SertifikatBatchZod,
  type SertifikatType,
  TipRacuna,
} from "ied-shared";
import { validateRequestBody } from "../middleware/validateSchema";
import { generateDocxBuffer } from "../services/docx.service";
import { generateCertificatesZipBuffer } from "../services/pdf.service";

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

    const { buffer, fileName } = generateDocxBuffer(tipRacuna, req.body);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(buffer);
  },
);

router.post(
  "/generate-pdf-files",
  validateRequestBody(SertifikatBatchZod),
  async (req: Request<{}, any, SertifikatType[]>, res) => {
    const { buffer, fileName } = await generateCertificatesZipBuffer(req.body);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(buffer);
  },
);

export default router;
