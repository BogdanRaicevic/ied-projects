import { Router } from "express";
import { getMesta, getMestaNames } from "../services/mesto.service";

const router = Router();

router.get("/all-names", async (_req, res) => {
  const result = await getMestaNames();
  res.json(result || []);
});

router.get("/all", async (_req, res) => {
  const result = await getMesta();
  res.json(result || []);
});

export default router;
