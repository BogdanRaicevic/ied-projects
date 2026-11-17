import { type Request, type Response, Router } from "express";
import { getAllStanjaFirmi } from "../services/stanje_firme.service";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const result = await getAllStanjaFirmi();
  res.json(result || []);
});

export default router;
