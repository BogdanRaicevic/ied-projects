import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { getAllStanjaFirmi } from "../services/stanje_firme.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllStanjaFirmi();
    if (!result) {
      res.status(404).send("Stanje firme not found");
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
