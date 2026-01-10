import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import {
  type PretrageRacunaType,
  type RacunQueryType,
  type RacunType,
  RacunZod,
} from "ied-shared";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import { validateRequestBody } from "../middleware/validateSchema";
import {
  getRacunById,
  getRacunByPozivNaBrojAndIzdavac,
  saveRacun,
  searchRacuni,
  updateRacunById,
} from "../services/racuni.service";

const router = Router();

router.get(
  "/izdavaci",
  async (_req: Request, res: Response, next: NextFunction) => {
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
  },
);

router.post(
  "/search",
  async (
    req: Request<
      {},
      {},
      { pageSize: number; pageIndex: number } & PretrageRacunaType
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { pageIndex = 0, pageSize = 10, ...queryParameters } = req.body;

      const result = await searchRacuni(pageIndex, pageSize, queryParameters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
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
  },
);

router.post(
  "/save",
  validateRequestBody(RacunZod),
  async (
    req: Request<{}, any, RacunType>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await saveRacun(req.body);
      res.json(result || []);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/update/:id",
  validateRequestBody(RacunZod),
  async (
    req: Request<{ id: string }, any, RacunType>,
    res: Response,
    next: NextFunction,
  ) => {
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
  },
);

router.get(
  "/",
  async (
    req: Request<{}, any, any, RacunQueryType>,
    res: Response,
    next: NextFunction,
  ) => {
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

      const racun = await getRacunByPozivNaBrojAndIzdavac(
        pozivNaBroj,
        izdavacRacuna,
        tipRacuna,
      );
      if (!racun) {
        res.status(404).send("Racun not found");
        return;
      }
      res.json(racun);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
