import { Router, Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";

import {
  findById,
  deleteById,
  create,
  updateById,
  search,
  findByFirmaId,
} from "../services/firma.service";
import { FirmaType } from "../models/firma.model";

const router = Router();

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 100, ...query } = req.body;
    const cursor = await search(query as FilterQuery<FirmaType>, Number(page), Number(pageSize));

    const results: FirmaType[] = [];
    cursor.on("data", (doc) => {
      results.push(doc);
    });

    cursor.on("end", () => {
      res.json(results);
    });

    cursor.on("error", (error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const firma = await findByFirmaId(Number(id));
    if (!firma) {
      return res.status(404).send("Firma not found");
    }
    res.json(firma);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firma = await deleteById(req.params.id);
    if (firma) {
      res.json(firma);
    } else {
      res.status(404).send("Firma not found");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firma = await create(req.body);
    res.status(201).json(firma);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firma = await updateById(req.params.id, req.body);
    if (firma) {
      res.json(firma);
    } else {
      res.status(404).send("Firma not found");
    }
  } catch (error) {
    next(error);
  }
});

export default router;
