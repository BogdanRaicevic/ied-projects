import { Router, type Request, type Response, type NextFunction } from "express";
import { getAllDelatnosti } from "../services/delatnost.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllDelatnosti();
    if (!result) {
      res.status(404).send("Delatnosti not found");
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
