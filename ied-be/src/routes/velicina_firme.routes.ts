import { Router, type Request, type Response, type NextFunction } from "express";
import { getAllVelicineFirmi } from "../services/velicina_firme.service.js";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
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
