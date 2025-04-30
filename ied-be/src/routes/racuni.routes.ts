import { Router, type Request, type Response, type NextFunction } from "express";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import { getRacunById, searchRacuni } from "../services/racuni.service";

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

export default router;
