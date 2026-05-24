import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { type RacunV2Form, RacunV2Zod } from "ied-shared";

const router = Router();

router.post(
  "/generate",
  async (
    req: Request<{}, any, RacunV2Form>,
    res: Response,
    next: NextFunction,
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

      res.json({
        ok: true,
        message: "Racun V2 payload received.",
        tipRacuna: parsed.data.tipRacuna,
        pozivNaBroj: parsed.data.pozivNaBroj,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
