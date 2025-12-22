import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { getAllTipoviFirme } from "../services/tip_firme.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllTipoviFirme();
    res.json(result || []);
  } catch (error) {
    next(error);
  }
});

export default router;
