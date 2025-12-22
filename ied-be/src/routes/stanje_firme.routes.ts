import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { getAllStanjaFirmi } from "../services/stanje_firme.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllStanjaFirmi();
    res.json(result || []);
  } catch (error) {
    next(error);
  }
});

export default router;
