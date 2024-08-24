import { getAllPretrage, savePretraga } from "./../services/pretrage.service";
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllPretrage();
    if (!result) {
      return res.status(404).send("Pretrage not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/save", async (req, res, next: NextFunction) => {
  const { queryParameters } = req.body;

  try {
    await savePretraga(queryParameters);
    res.send(200);
  } catch (error) {
    next(error);
  }
});

export default router;
