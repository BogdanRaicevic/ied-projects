import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { type TipSeminara, TipSeminaraSchema } from "ied-shared";
import {
  createTipSeminara,
  deleteTipSeminara,
  getAllTipSeminara,
  updateTipSeminara,
} from "../services/tip_seminara.service";
import { validateMongoId } from "../utils/utils";

const router = Router();

router.get(
  "/all-tip-seminara",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getAllTipSeminara();
      res.json(result || []);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/create",
  async (
    req: Request<{}, {}, TipSeminara>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      console.log("req.body", req.body);
      const parsed = TipSeminaraSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
      }
      const result = await createTipSeminara(parsed.data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/update/:id",
  async (
    req: Request<{ id: string }, {}, TipSeminara>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsed = TipSeminaraSchema.safeParse(req.body);
      console.log("parsed", parsed);
      if (!parsed.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
      }
      validateMongoId(req.params.id);

      const result = await updateTipSeminara(req.params.id, parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/delete/:id",
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      validateMongoId(req.params.id);
      await deleteTipSeminara(req.params.id);
      res.status(200).json({ message: "Tip seminara deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
