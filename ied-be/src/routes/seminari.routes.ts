import { Router, Request, Response, NextFunction } from "express";
import { saveSeminar, searchSeminari } from "../services/seminar.service";

const router = Router();

router.post("/save", async (req: Request, res: Response, next: NextFunction) => {
  const { naziv, predavac, lokacija } = req.body;
  try {
    saveSeminar({ naziv, predavac, lokacija });
    res.send({ success: true, message: "Seminar created" });
  } catch (error) {
    next(error);
  }
});

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  const { naziv, predavac, lokacija } = req.body;

  try {
    const result = await searchSeminari({ naziv, predavac, lokacija });
    res.send(result);
  } catch (error) {
    next(error);
  }
});

export default router;
