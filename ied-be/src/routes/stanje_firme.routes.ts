import { Router } from "express";
import { getAllStanjaFirmi } from "../services/stanje_firme.service";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await getAllStanjaFirmi();
  res.json(result || []);
});

export default router;
