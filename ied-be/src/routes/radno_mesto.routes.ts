import { type Request, type Response, Router } from "express";
import {
  getAllRadnaMesta,
  getAllRadnaMestaNames,
} from "../services/radno_mesto.service";

const router = Router();

router.get("/all-names", async (_req: Request, res: Response) => {
  const result = await getAllRadnaMestaNames();
  res.json(result || []);
});

router.get("/all", async (_req: Request, res: Response) => {
  const result = await getAllRadnaMesta();
  res.json(result || []);
});

export default router;
