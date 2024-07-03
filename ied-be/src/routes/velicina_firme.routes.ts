import { Router, Request, Response, NextFunction } from "express";
import { getAllVelicineFirmi } from "../services/velicina_firme.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const velicinaFirme = await getAllVelicineFirmi();
    if (!velicinaFirme) {
      return res.status(404).send("velicina firme not found");
    }
    res.json(velicinaFirme);
  } catch (error) {
    next(error);
  }
});

export default router;
