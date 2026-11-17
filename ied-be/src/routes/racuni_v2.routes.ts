import { type Request, type Response, Router } from "express";
import { type RacunV2Parsed, RacunV2Zod, TipRacuna } from "ied-shared";
import { validateRequestBody } from "../middleware/validateSchema";
import { generateRacunV2Pdf } from "../services/racuni_v2.service";

const router = Router();

router.post(
  "/generate",
  validateRequestBody(RacunV2Zod),
  async (req: Request<{}, any, RacunV2Parsed>, res: Response) => {
    const racun = req.body;

    if (
      racun.tipRacuna !== TipRacuna.PREDRACUN &&
      racun.tipRacuna !== TipRacuna.AVANSNI_RACUN
    ) {
      res.status(400).json({
        message:
          "Racun V2 PDF POC currently supports only Predracun and Avansni racun.",
        tipRacuna: racun.tipRacuna,
      });
      return;
    }

    if (racun.valuta !== "RSD") {
      res.status(400).json({
        message: "Racun V2 PDF POC currently supports only RSD.",
        valuta: racun.valuta,
      });
      return;
    }

    const { buffer, fileName } = await generateRacunV2Pdf(racun);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(buffer);
  },
);

export default router;
