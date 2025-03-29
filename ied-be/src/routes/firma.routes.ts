import { Router, type Request, type Response, type NextFunction } from "express";
import {
  deleteById,
  create,
  updateById,
  search,
  exportSearchedFirmaData,
  exportSearchedZaposleniData,
  findById,
} from "../services/firma.service.js";
import type { FirmaType } from "../models/firma.model.js";
import type { FirmaQueryParams } from "@ied-shared/types/firmaQueryParams.js";

const router = Router();

interface SearchRequest extends Request {
  body: {
    pageIndex?: number;
    pageSize?: number;
    queryParameters: FirmaQueryParams;
  };
}

router.post("/search", async (req: SearchRequest, res: Response, next: NextFunction) => {
  try {
    const { pageIndex = 1, pageSize = 10, ...query } = req.body;
    const { queryParameters } = query;
    const paginationResult = await search(queryParameters, Number(pageIndex), Number(pageSize));

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
  const { queryParameters } = req.body;

  try {
    const data = await exportSearchedFirmaData(queryParameters);

    res.send(data);
  } catch (error) {
    console.error("Error exporting firma data:", error);
    res.status(500).send("Error exporting firma data");
  }
});

router.post("/export-zaposleni-data", async (req, res) => {
  const { queryParameters } = req.body;
  try {
    const data = await exportSearchedZaposleniData(queryParameters);

    res.send(data);
  } catch (error) {
    console.error("Error exporting zaposleni data:", error);
    res.status(500).send("Error exporting zaposleni data");
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const firma = await findById(String(id));
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

router.post("/:id", async (req: Request, res: Response, next: NextFunction) => {
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
