import { type Request, type Response, Router } from "express";
import { getAllVelicineFirmi } from "../services/velicina_firme.service";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const result = await getAllVelicineFirmi();
  res.json(result);
});

export default router;
