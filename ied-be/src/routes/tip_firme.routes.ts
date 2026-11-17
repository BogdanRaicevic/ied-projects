import { Router } from "express";
import { getAllTipoviFirme } from "../services/tip_firme.service";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await getAllTipoviFirme();
  res.json(result || []);
});

export default router;
