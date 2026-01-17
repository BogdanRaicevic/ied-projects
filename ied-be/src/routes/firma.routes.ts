import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import type { ParametriPretrage } from "ied-shared";
import { createAuditMiddleware } from "../middleware/audit";
import { Firma, type FirmaType } from "../models/firma.model";
import {
  create,
  createZaposleni,
  deleteById,
  deleteZaposleni,
  exportSearchedFirmaData,
  exportSearchedZaposleniData,
  findById,
  search,
  updateById,
  updateZaposleni,
} from "../services/firma.service";

const router = Router();
const firmaAudit = createAuditMiddleware(Firma);

interface SearchRequest extends Request {
  body: {
    pageIndex?: number;
    pageSize?: number;
    queryParameters: ParametriPretrage;
  };
}

// table search
router.post(
  "/search",
  async (req: SearchRequest, res: Response, next: NextFunction) => {
    try {
      const { pageIndex = 0, pageSize = 10, ...query } = req.body;
      const { queryParameters } = query;
      const paginationResult = await search(
        queryParameters,
        Number(pageIndex),
        Number(pageSize),
      );

      const results: FirmaType[] = [];
      paginationResult.cursor.on("data", (doc) => {
        results.push(doc);
      });

      paginationResult.cursor.on("end", async () => {
        await paginationResult.cursor.close();
        res.json({
          firmas: results,
          totalPages: paginationResult.totalPages,
          totalDocuments: paginationResult.totalDocuments,
        });
      });

      paginationResult.cursor.on("error", async (error) => {
        await paginationResult.cursor.close();
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      });
    } catch (error) {
      next(error);
    }
  },
);

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

// create new zapolseni
router.post(
  "/:firmaId/zaposleni",
  firmaAudit,
  async (
    req: Request<{ firmaId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { firmaId } = req.params;
      const updatedFirma = await createZaposleni(firmaId, req.body);
      res.status(201).json(updatedFirma);
    } catch (error) {
      next(error);
    }
  },
);

// update zaposleni
router.put(
  "/:firmaId/zaposleni/:zaposleniId",
  firmaAudit,
  async (
    req: Request<{ firmaId: string; zaposleniId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { firmaId, zaposleniId } = req.params;
      const updatedFirma = await updateZaposleni(
        firmaId,
        zaposleniId,
        req.body,
      );
      res.status(201).json(updatedFirma);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:firmaId/zaposleni/:zaposleniId",
  firmaAudit,
  async (
    req: Request<{ firmaId: string; zaposleniId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { firmaId, zaposleniId } = req.params;
      await deleteZaposleni(firmaId, zaposleniId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// Get firma
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const firma = await findById(String(id));
    if (!firma) {
      res.status(404).send("Firma not found");
      return;
    }
    res.json(firma);
  } catch (error) {
    next(error);
  }
});

// Delete firma
router.delete(
  "/:id",
  firmaAudit,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const firmaId = req.params.id;
      const firma = await deleteById(firmaId);
      res.json(firma || []);
    } catch (error) {
      next(error);
    }
  },
);

// Create new firma
router.post(
  "/",
  firmaAudit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const firma = await create(req.body);
      res.status(201).json(firma);
    } catch (error) {
      next(error);
    }
  },
);

// Update firma
router.put(
  "/:id",
  firmaAudit,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const firmaId = req.params.id;
      const firma = await updateById(firmaId, req.body);
      if (firma) {
        res.json(firma);
      } else {
        res.status(404).send("Firma not found");
      }
    } catch (error) {
      next(error);
    }
  },
);

export default router;
