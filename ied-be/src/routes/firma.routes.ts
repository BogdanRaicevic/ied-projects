import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import {
  ContactTypeEnum,
  FirmaSchema,
  ParametriPretrageSchema,
  ZaposleniSchema,
} from "ied-shared";
import { z } from "zod";
import { createAuditMiddleware } from "../middleware/audit";
import { validateRequestBody } from "../middleware/validateSchema";
import { Firma } from "../models/firma.model";
import {
  create,
  createZaposleni,
  deleteFirmaById,
  deleteZaposleni,
  exportSearchedFirmaData,
  exportSearchedZaposleniData,
  findFirmaById,
  search,
  updateFirmaById,
  updateLastContact,
  updateZaposleni,
} from "../services/firma.service";
import { getClerkEmailFromRequest } from "../utils/utils";

const router = Router();
const firmaAudit = createAuditMiddleware(Firma);

const ExportRequestSchema = z.object({
  queryParameters: ParametriPretrageSchema,
});

// Ids come from the URL; zaposleni and last_contacted have their own routes.
const CreateFirmaSchema = FirmaSchema.omit({ _id: true, last_contacted: true });
const UpdateFirmaSchema = CreateFirmaSchema.omit({ zaposleni: true }).partial();
const CreateZaposleniSchema = ZaposleniSchema.omit({ _id: true });
// Partial: the kontakt/prijava dialogs send only komentar (+ firmaKomentar).
const UpdateZaposleniSchema = CreateZaposleniSchema.partial().extend({
  firmaKomentar: z.string().max(10000).optional(),
});

const LastContactQuerySchema = z.object({ contactType: ContactTypeEnum });

const SearchRequestSchema = ExportRequestSchema.extend({
  pageIndex: z.number().int().min(0).default(0),
  // 100 is the largest page size the table offers.
  pageSize: z.number().int().min(1).max(100).default(10),
});

// table search
router.post(
  "/search",
  validateRequestBody(SearchRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageIndex, pageSize, queryParameters } = req.body as z.infer<
        typeof SearchRequestSchema
      >;
      res.json(await search(queryParameters, pageIndex, pageSize));
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/export-firma-data",
  validateRequestBody(ExportRequestSchema),
  async (req, res) => {
    const { queryParameters } = req.body;

    try {
      const data = await exportSearchedFirmaData(queryParameters);

      res.send(data);
    } catch (error) {
      console.error("Error exporting firma data:", error);
      res.status(500).send("Error exporting firma data");
    }
  },
);

router.post(
  "/export-zaposleni-data",
  validateRequestBody(ExportRequestSchema),
  async (req, res) => {
    const { queryParameters } = req.body;
    try {
      const data = await exportSearchedZaposleniData(queryParameters);

      res.send(data);
    } catch (error) {
      console.error("Error exporting zaposleni data:", error);
      res.status(500).send("Error exporting zaposleni data");
    }
  },
);

// create new zapolseni
router.post(
  "/:firmaId/zaposleni",
  firmaAudit,
  validateRequestBody(CreateZaposleniSchema),
  async (
    req: Request<{ firmaId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { firmaId } = req.params;
      const updatedFirma = await createZaposleni(firmaId, req.body);
      res.status(200).json(updatedFirma);
    } catch (error) {
      next(error);
    }
  },
);

// update zaposleni
router.put(
  "/:firmaId/zaposleni/:zaposleniId",
  firmaAudit,
  validateRequestBody(UpdateZaposleniSchema),
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
    const firma = await findFirmaById(String(id));
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
      const firma = await deleteFirmaById(firmaId);
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
  validateRequestBody(CreateFirmaSchema),
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
  validateRequestBody(UpdateFirmaSchema),
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const firmaId = req.params.id;
      const firma = await updateFirmaById(firmaId, req.body);
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

// add new contact to firma
router.put(
  "/:id/last-contact",
  firmaAudit,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { contactType } = LastContactQuerySchema.parse(req.query);
      const userEmail = await getClerkEmailFromRequest(req);
      // requireApiAuth already checked the session; a missing email means the Clerk lookup failed.
      if (!userEmail) {
        throw new Error("Could not resolve the caller's email from Clerk");
      }
      const firmaId = req.params.id;

      const updatedFirma = await updateLastContact({
        firmaId,
        userEmail,
        contactType,
      });
      if (updatedFirma) {
        res.status(200).json(updatedFirma);
      } else {
        res.status(404).send("Firma not found");
      }
    } catch (error) {
      next(error);
    }
  },
);

export default router;
