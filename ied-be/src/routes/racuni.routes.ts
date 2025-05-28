import { Router, type Request, type Response, type NextFunction } from "express";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import {
  getRacunById,
  getRacunByPozivNaBrojAndIzdavac,
  saveRacun,
  searchRacuni,
  updateRacunById,
} from "../services/racuni.service";
import { validate } from "../middleware/validateSchema";
import { RacunZod, RacunQueryZod, RacunSchema, PretrageRacunaZodType } from "@ied-shared/index";

const router = Router();

router.get("/izdavaci", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = izdavacRacuna.map((i) => {
      return {
        id: i.id,
        tekuciRacuni: i.tekuciRacuni,
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/search",
  async (
    req: Request<{}, {}, { pageSize: number; pageIndex: number } & PretrageRacunaZodType>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageIndex = 0, pageSize = 10, ...queryParameters } = req.body;

      const result = await searchRacuni(pageIndex, pageSize, queryParameters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const racun = await getRacunById(id);
    if (!racun) {
      res.status(404).send("Racun not found");
      return;
    }
    res.json(racun);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/save",
  validate(RacunSchema),
  async (req: Request<{}, any, RacunZod>, res: Response, next: NextFunction) => {
    try {
      const result = await saveRacun(req.body);
      if (!result) {
        res.status(404).send("Racun not found");
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/update/:id",
  validate(RacunSchema),
  async (req: Request<{ id: string }, any, RacunZod>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const racun = req.body;
      const result = await updateRacunById(id, racun);
      if (!result) {
        res.status(404).send("Racun not found");
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/",
  async (req: Request<{}, any, any, RacunQueryZod>, res: Response, next: NextFunction) => {
    try {
      const { pozivNaBroj, izdavacRacuna, tipRacuna } = req.query;

      if (
        typeof pozivNaBroj !== "string" ||
        typeof izdavacRacuna !== "string" ||
        (tipRacuna && typeof tipRacuna !== "string")
      ) {
        res.status(400).send("Invalid query parameter types");
        return;
      }

      if (!pozivNaBroj || !izdavacRacuna) {
        res.status(400).send("Missing required query parameters");
        return;
      }

      const racun = await getRacunByPozivNaBrojAndIzdavac(pozivNaBroj, izdavacRacuna, tipRacuna);
      if (!racun) {
        res.status(404).send("Racun not found");
        return;
      }
      res.json(racun);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
