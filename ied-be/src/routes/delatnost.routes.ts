import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { getAllDelatnosti } from "../services/delatnost.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllDelatnosti();
    res.json(result || []);
  } catch (error) {
    next(error);
  }
});

export default router;
