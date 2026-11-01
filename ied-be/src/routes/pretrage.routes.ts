import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { ParametriPretrageSchema } from "ied-shared";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { validateRequestBody } from "../middleware/validateSchema";
import {
  deletePretraga,
  getAllPretrage,
  savePretraga,
} from "./../services/pretrage.service";

const router = Router();

const objectId = z.string().refine(isValidObjectId, "Invalid id");

const SavePretragaSchema = z.object({
  queryParameters: ParametriPretrageSchema,
  pretraga: z.object({ id: objectId.optional(), naziv: z.string() }),
});

const DeletePretragaSchema = z.object({ id: objectId });

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllPretrage();
    res.json(result || []);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/save",
  validateRequestBody(SavePretragaSchema),
  async (req, res, next: NextFunction) => {
    const { queryParameters, pretraga } = req.body as z.infer<
      typeof SavePretragaSchema
    >;

    try {
      await savePretraga(queryParameters, pretraga);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/delete",
  validateRequestBody(DeletePretragaSchema),
  async (req, res, next: NextFunction) => {
    const { id } = req.body as z.infer<typeof DeletePretragaSchema>;
    try {
      await deletePretraga(id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
