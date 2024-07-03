import { Router, Request, Response, NextFunction } from "express";
import { getAllDelatnosti } from "../services/delatnost.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllDelatnosti();
    if (!result) {
      return res.status(404).send("Delatnosti not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
