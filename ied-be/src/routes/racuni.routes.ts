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
import { RacunZod, RacunQueryZod, RacunSchema } from "@ied-shared/index";

const router = Router();

router.get("/izdavaci", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = izdavacRacuna.map((i) => {
      return {
        id: i.id,
        tekuciRacuni: i.tekuciRacuni,
      };
    });
    if (!result) {
      return res.status(404).send("Izdavaci not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageIndex, pageSize, ...queryParmaneters } = req.body;

    const result = await searchRacuni(pageIndex, pageSize, queryParmaneters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const racun = await getRacunById(id);
    if (!racun) {
      return res.status(404).send("Racun not found");
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
      const racun = req.body;
      const result = await saveRacun(racun);
      if (!result) {
        return res.status(404).send("Racun not found");
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
        return res.status(404).send("Racun not found");
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
        return res.status(400).send("Invalid query parameter types");
      }

      console.log("Query parameters:", req.query);

      if (!pozivNaBroj || !izdavacRacuna) {
        return res.status(400).send("Missing required query parameters");
      }

      const racun = await getRacunByPozivNaBrojAndIzdavac(pozivNaBroj, izdavacRacuna, tipRacuna);
      if (!racun) {
        return res.status(404).send("Racun not found");
      }
      res.json(racun);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
