import {
  type Request,
  type Response,
  Router,
} from "express";
import { type RacunV2Form, RacunV2Zod, TipRacuna } from "ied-shared";
import { generatePredracunV2Pdf } from "../services/racuni_v2.service";
import { getTemplateErrorDetails } from "../utils/docx.utils";

const router = Router();

router.post(
  "/generate",
  async (
    req: Request<{}, any, RacunV2Form>,
    res: Response,
  ) => {
    console.log("[RacunV2] Generate request payload:", req.body);

    try {
      const parsed = await RacunV2Zod.safeParseAsync(req.body);

      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.issues,
        });
        return;
      }

      if (parsed.data.tipRacuna !== TipRacuna.PREDRACUN) {
        res.status(400).json({
          message: "Racun V2 PDF POC currently supports only Predracun.",
          tipRacuna: parsed.data.tipRacuna,
        });
        return;
      }

      if (parsed.data.valuta !== "RSD") {
        res.status(400).json({
          message: "Racun V2 PDF POC currently supports only RSD.",
          valuta: parsed.data.valuta,
        });
        return;
      }

      const { buffer, fileName } = await generatePredracunV2Pdf(parsed.data);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.send(buffer);
    } catch (error) {
      console.error("Racun V2 PDF generation error:", error);
      res.status(500).json({
        error: "Error generating Racun V2 PDF",
        details: getTemplateErrorDetails(error),
      });
    }
  },
);

export default router;
