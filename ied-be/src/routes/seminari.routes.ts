import {
  type ExtendedSearchSeminarType,
  ExtendedSearchSeminarZod,
  PrijavaSchema,
  SeminarSchema,
} from "@ied-shared/types/seminar.zod";
import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import type { z } from "zod";
import { createAuditMiddleware } from "../middleware/audit";
import { validateRequestBody } from "../middleware/validateSchema";
import { Seminar, type SeminarType } from "../models/seminar.model";
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
import { ErrorWithCause } from "../utils/customErrors";

const router = Router();
const seminariAudit = createAuditMiddleware(Seminar);

router.post(
  "/create",
  seminariAudit,
  validateRequestBody(SeminarSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const seminar = await createSeminar(req.body);
      res.status(201).json(seminar);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/update/:id",
  seminariAudit,
  validateRequestBody(SeminarSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const updatedSeminar = await updateSeminar(id, req.body);
      res.status(200).json(updatedSeminar);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/search",
  validateRequestBody(ExtendedSearchSeminarZod),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paginationResult = await searchSeminars(
        req.body as ExtendedSearchSeminarType,
      );

      const results: SeminarType[] = [];
      paginationResult.courser.on("data", (doc) => {
        results.push(doc);
      });

      paginationResult.courser.on("end", async () => {
        await paginationResult.courser.close();
        res.json({
          seminari: results,
          totalPages: paginationResult.totalPages,
          totalDocuments: paginationResult.totalDocuments,
        });
      });

      paginationResult.courser.on("error", async (error) => {
        await paginationResult.courser.close();
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/firma-seminari",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageIndex, pageSize, queryParams } = req.body as Record<
        string,
        unknown
      >;
      const firmaSeminari = await searchFirmaSeminars(
        pageIndex as number,
        pageSize as number,
        null,
      );
      res.status(200).json(firmaSeminari);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/all-seminars",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const allSeminars = await getAllSeminars();
      res.status(200).json(allSeminars);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seminar = await getSeminarById(req.params.id);
    res.status(200).json(seminar);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/create-prijava/:id",
  seminariAudit, // Apply audit middleware
  validateRequestBody(PrijavaSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: seminar_id } = req.params;
    const prijava = req.body as z.infer<typeof PrijavaSchema>;
    try {
      const response = await createPrijava(seminar_id, prijava);
      res.status(201).json(response);
    } catch (error: unknown) {
      if (error instanceof ErrorWithCause && error.code === "duplicate") {
        res.status(409).json({ message: error.message });
      } else {
        next(error);
      }
    }
  },
);

router.post(
  "/update-prijava/:id",
  seminariAudit, // Apply audit middleware
  validateRequestBody(PrijavaSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: seminar_id } = req.params;
    const prijava = req.body as z.infer<typeof PrijavaSchema>;
    try {
      const response = await updatePrijava(seminar_id, prijava);
      res.status(201).json(response);
    } catch (error: unknown) {
      if (error instanceof ErrorWithCause && error.code === "duplicate") {
        res.status(409).json({ message: error.message });
      } else {
        next(error);
      }
    }
  },
);

router.delete(
  "/delete-prijava/:id/:zaposleni_id",
  seminariAudit, // Apply audit middleware

  async (req: Request, res: Response, next: NextFunction) => {
    const { id: seminar_id, zaposleni_id } = req.params;
    try {
      const prijava = await deletePrijava(
        zaposleni_id as string,
        seminar_id as string,
      );
      res.status(200).json(prijava);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/delete/:id",
  seminariAudit, // Apply audit middleware
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedSeminar = await deleteSeminar(req.params.id);
      res.status(200).json(deletedSeminar);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
