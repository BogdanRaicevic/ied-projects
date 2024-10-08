import { Router, Request, Response, NextFunction } from "express";
import { getAllVelicineFirmi } from "../services/velicina_firme.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllVelicineFirmi();
    if (!result) {
      return res.status(404).send("Velicina firme not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
