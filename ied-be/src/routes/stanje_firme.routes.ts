import { Router, Request, Response, NextFunction } from "express";
import { getAllStanjaFirmi } from "../services/stanje_firme.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllStanjaFirmi();
    if (!result) {
      return res.status(404).send("Stanje firme not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
