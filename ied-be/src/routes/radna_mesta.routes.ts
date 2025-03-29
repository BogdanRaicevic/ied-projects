import { Router, type Request, type Response, type NextFunction } from "express";
import { getAllRadnaMesta } from "../services/radna_mesta.service.js";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllRadnaMesta();
    if (!result) {
      return res.status(404).send("Radna mesta not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
