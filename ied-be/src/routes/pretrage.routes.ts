import { getAllPretrage } from "./../services/pretrage.service";
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllPretrage();
    if (!result) {
      return res.status(404).send("Pretrage not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
