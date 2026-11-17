import { Router } from "express";
import { getAllDelatnosti } from "../services/delatnost.service";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await getAllDelatnosti();
  res.json(result || []);
});

export default router;
