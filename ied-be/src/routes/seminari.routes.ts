import { type Request, type Response, Router } from "express";
import {
  type ExtendedSearchSeminarType,
  ExtendedSearchSeminarZod,
  type FirmaSeminarSearchParams,
  FirmaSeminarSearchParamsSchema,
  PrijavaSchema,
  SeminarSchema,
} from "ied-shared";
import { z } from "zod";
import { createAuditMiddleware } from "../middleware/audit";
import { validateRequestBody } from "../middleware/validateSchema";
import { Seminar } from "../models/seminar.model";
import {
  createPrijava,
  createSeminar,
  deletePrijava,
  deleteSeminar,
  getAllSeminars,
  getSeminarById,
  searchFirmaSeminars,
  searchSeminars,
  updatePrijava,
  updateSeminar,
} from "../services/seminar.service";

const router = Router();
const seminariAudit = createAuditMiddleware(Seminar);

router.post(
  "/create",
  seminariAudit,
  validateRequestBody(SeminarSchema),
  async (req: Request, res: Response) => {
    const seminar = await createSeminar(req.body);
    res.status(201).json(seminar);
  },
);

router.post(
  "/update/:id",
  seminariAudit,
  validateRequestBody(SeminarSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const updatedSeminar = await updateSeminar(id, req.body);
    res.status(200).json(updatedSeminar);
  },
);

router.post(
  "/search",
  validateRequestBody(ExtendedSearchSeminarZod),
  async (req: Request, res: Response) => {
    const result = await searchSeminars(req.body as ExtendedSearchSeminarType);

    res.json(result);
  },
);

const FirmaSeminarQuerySchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  queryParameters: FirmaSeminarSearchParamsSchema,
});

router.post(
  "/firma-seminari",
  validateRequestBody(FirmaSeminarQuerySchema),
  async (req: Request, res: Response) => {
    const { pageIndex, pageSize, queryParameters } = req.body;

    const firmaSeminari = await searchFirmaSeminars(
      pageIndex as number,
      pageSize as number,
      queryParameters as FirmaSeminarSearchParams,
    );
    res.status(200).json(firmaSeminari);
  },
);

router.get("/all-seminars", async (_req: Request, res: Response) => {
  const allSeminars = await getAllSeminars();
  res.status(200).json(allSeminars);
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const seminar = await getSeminarById(req.params.id);
  res.status(200).json(seminar);
});

router.post(
  "/create-prijava/:id",
  seminariAudit, // Apply audit middleware
  validateRequestBody(PrijavaSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const prijava = req.body as z.infer<typeof PrijavaSchema>;
    const response = await createPrijava(id, prijava);
    if (!response) {
      res.status(409).json({
        message: "Zaposleni is already registered for this seminar",
      });
      return;
    }
    res.status(201).json(response);
  },
);

router.post(
  "/update-prijava/:id",
  seminariAudit, // Apply audit middleware
  validateRequestBody(PrijavaSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const prijava = req.body as z.infer<typeof PrijavaSchema>;
    const response = await updatePrijava(id, prijava);
    res.status(201).json(response);
  },
);

router.delete(
  "/delete-prijava/:id/:zaposleni_id",
  seminariAudit, // Apply audit middleware

  async (req: Request, res: Response) => {
    const { id: seminar_id, zaposleni_id } = req.params;
    const prijava = await deletePrijava(
      zaposleni_id as string,
      seminar_id as string,
    );
    res.status(200).json(prijava);
  },
);

router.delete(
  "/delete/:id",
  seminariAudit, // Apply audit middleware
  async (req: Request<{ id: string }>, res: Response) => {
    const deletedSeminar = await deleteSeminar(req.params.id);
    res.status(200).json(deletedSeminar);
  },
);

export default router;
