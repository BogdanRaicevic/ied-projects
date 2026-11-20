import { Router } from "express";
import { getIzdavaci } from "../services/izdavac.service";

const router = Router();

router.get("/", async (_req, res) => {
  res.json(await getIzdavaci());
});

export default router;
