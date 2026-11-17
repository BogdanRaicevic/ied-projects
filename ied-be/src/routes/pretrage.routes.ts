import { Router } from "express";
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

router.get("/", async (_req, res) => {
  const result = await getAllPretrage();
  res.json(result || []);
});

router.post(
  "/save",
  validateRequestBody(SavePretragaSchema),
  async (req, res) => {
    const { queryParameters, pretraga } = req.body;

    await savePretraga(queryParameters, pretraga);
    res.sendStatus(200);
  },
);

router.post(
  "/delete",
  validateRequestBody(DeletePretragaSchema),
  async (req, res) => {
    const { id } = req.body;
    await deletePretraga(id);
    res.sendStatus(200);
  },
);

export default router;
