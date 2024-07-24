import { Router, Request, Response, NextFunction } from "express";
import { getAllMesta } from "../services/mesta.service";

const router = Router();

router.get("/all-names", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("ovde am");
    const result = await getAllMesta();
    if (!result) {
      return res.status(404).send("Mesta not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
