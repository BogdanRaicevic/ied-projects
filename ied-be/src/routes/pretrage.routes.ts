import { deletePretraga, getAllPretrage, savePretraga } from "./../services/pretrage.service.js";
import { Router, type Request, type Response, type NextFunction } from "express";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
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
  const { queryParameters, pretraga } = req.body;

  try {
    await savePretraga(queryParameters, pretraga);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/delete", async (req, res, next: NextFunction) => {
  const { id } = req.body;
  try {
    await deletePretraga(id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export default router;
