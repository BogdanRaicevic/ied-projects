import { type Request, type Response, Router } from "express";
import { type TipSeminara, TipSeminaraSchema } from "ied-shared";
import { validateRequestBody } from "../middleware/validateSchema";
import {
  createTipSeminara,
  deleteTipSeminara,
  getAllTipSeminara,
  updateTipSeminara,
} from "../services/tip_seminara.service";
import { validateMongoId } from "../utils/utils";

const router = Router();

router.get("/all-tip-seminara", async (_req: Request, res: Response) => {
  const result = await getAllTipSeminara();
  res.json(result || []);
});

router.post(
  "/create",
  validateRequestBody(TipSeminaraSchema),
  async (req: Request<{}, {}, TipSeminara>, res: Response) => {
    const result = await createTipSeminara(req.body);
    res.status(201).json(result);
  },
);

router.put(
  "/update/:id",
  validateRequestBody(TipSeminaraSchema),
  async (req: Request<{ id: string }, {}, TipSeminara>, res: Response) => {
    validateMongoId(req.params.id);

    const result = await updateTipSeminara(req.params.id, req.body);
    res.status(200).json(result);
  },
);

router.delete(
  "/delete/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    validateMongoId(req.params.id);
    await deleteTipSeminara(req.params.id);
    res.status(200).json({ message: "Tip seminara deleted successfully" });
  },
);

export default router;
