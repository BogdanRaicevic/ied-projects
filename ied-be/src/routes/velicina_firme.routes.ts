import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { getAllVelicineFirmi } from "../services/velicina_firme.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllVelicineFirmi();
    if (!result) {
      res.status(404).send("Velicina firme not found");
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
