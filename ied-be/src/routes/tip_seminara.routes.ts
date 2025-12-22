import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { getAllTipSeminara } from "../services/tip_seminara.service";

const router = Router();

router.get("/all", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllTipSeminara();
    res.json(result || []);
  } catch (error) {
    next(error);
  }
});

export default router;
