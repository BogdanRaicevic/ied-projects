import { Router, Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";

import {
  deleteById,
  create,
  updateById,
  search,
  findByFirmaId,
  exportSearchedFirmaData,
} from "../services/firma.service";
import { FirmaType } from "../models/firma.model";
import path from "path";

const router = Router();

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("req body", req.body);
    const { pageIndex = 1, pageSize = 10, ...query } = req.body;
    const paginationResult = await search(
      query as FilterQuery<FirmaType>,
      Number(pageIndex),
      Number(pageSize)
    );

    const results: FirmaType[] = [];
    paginationResult.courser.on("data", (doc) => {
      results.push(doc);
    });

    paginationResult.courser.on("end", () => {
      res.json({
        firmas: results,
        totalPages: paginationResult.totalPages,
        totalDocuments: paginationResult.totalDocuments,
      });
    });

    paginationResult.courser.on("error", (error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
  } catch (error) {
    next(error);
  }
});

router.post("/export-firma-data", async (req, res) => {
  const { queryParameters, filePath } = req.body;

  if (!filePath) {
    return res.status(400).send("File path is required");
  }
  try {
    await exportSearchedFirmaData(queryParameters, filePath);
    res.download(filePath, "firma_data.csv", (err) => {
      if (err) {
        console.error("Error downloading the file:", err);
        res.status(500).send("Error downloading the file");
      } else {
        console.log("File downloaded successfully");
      }
    });
  } catch (error) {
    console.error("Error exporting firma data:", error);
    res.status(500).send("Error exporting firma data");
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
