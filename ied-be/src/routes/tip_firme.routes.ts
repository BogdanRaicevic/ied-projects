import { type Request, type Response, Router } from "express";
import { getAllTipoviFirme } from "../services/tip_firme.service";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const result = await getAllTipoviFirme();
  res.json(result || []);
});

export default router;
