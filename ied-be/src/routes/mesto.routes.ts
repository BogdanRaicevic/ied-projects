import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { getMesta, getMestaNames } from "../services/mesto.service";

const router = Router();

router.get(
  "/all-names",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getMestaNames();
      res.json(result || []);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/all", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getMesta();
    res.json(result || []);
  } catch (error) {
    next(error);
  }
});

export default router;
