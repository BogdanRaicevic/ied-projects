import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import {
  getAllRadnaMesta,
  getAllRadnaMestaNames,
} from "../services/radno_mesto.service";

const router = Router();

router.get(
  "/all-names",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getAllRadnaMestaNames();
      res.json(result || []);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/all", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllRadnaMesta();
    res.json(result || []);
  } catch (error) {
    next(error);
  }
});

export default router;
