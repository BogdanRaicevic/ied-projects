import { Router, Request, Response, NextFunction } from "express";
import { getAllRadnaMesta } from "../services/radna_mesta.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
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
