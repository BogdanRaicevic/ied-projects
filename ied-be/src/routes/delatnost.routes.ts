import { type Request, type Response, Router } from "express";
import { getAllDelatnosti } from "../services/delatnost.service";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const result = await getAllDelatnosti();
  res.json(result || []);
});

export default router;
