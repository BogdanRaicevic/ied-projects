import {
  PrijavaSchema,
  type SeminarQueryParams,
  SeminarQueryParamsSchema,
  SeminarSchema,
} from "@ied-shared/types/seminar.zod";
import { type NextFunction, type Request, type Response, Router } from "express";
import type { FilterQuery } from "mongoose";
import { z } from "zod";
import { createAuditMiddleware } from "../middleware/audit";
import { validate } from "../middleware/validateSchema";
import { Seminar, type SeminarType } from "../models/seminar.model";
import {
  deletePrijava,
  deleteSeminar,
  getAllSeminars,
  getSeminarById,
  savePrijava,
  saveSeminar,
  searchSeminars,
} from "../services/seminar.service";
import { ErrorWithCause } from "../utils/customErrors";

const router = Router();
const seminariAudit = createAuditMiddleware(Seminar);

router.post(
  "/save",
  seminariAudit, // Apply audit middleware
  validate(SeminarSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const seminar = await saveSeminar(req.body);
      res.locals.updatedDocument = seminar; // Store updated document for audit middleware
      res.status(201).json(seminar);
    } catch (error) {
      next(error);
    }
  },
);

const ExtendedSearchSeminarType = z.object({
  pageIndex: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  queryParameters: SeminarQueryParamsSchema,
});

router.post(
  "/search",
  validate(ExtendedSearchSeminarType),
  async (req: Request, res: Response, next: NextFunction) => {
    const { pageIndex = 1, pageSize = 10, ...query } = req.body;
    console.log("req body", req.body);
    const { datumOd, datumDo, ...rest } = query as SeminarQueryParams;

    try {
      const paginationResult = await searchSeminars(
        {
          ...rest,
          datumOd,
          datumDo,
        } as FilterQuery<SeminarType>,
        Number(pageIndex),
        Number(pageSize),
      );

      const results: SeminarType[] = [];
      paginationResult.courser.on("data", (doc) => {
        results.push(doc);
      });

      paginationResult.courser.on("end", () => {
        res.json({
          seminari: results,
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
  },
);

router.get("/all-seminars", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allSeminars = await getAllSeminars();
    res.status(200).json(allSeminars);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seminar = await getSeminarById(req.params.id);
    res.status(200).json(seminar);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/save-prijava/:id", // for audit middleware
  seminariAudit, // Apply audit middleware

  validate(PrijavaSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: seminar_id } = req.params;
    const prijava = req.body as z.infer<typeof PrijavaSchema>;
    try {
      const seminar = await savePrijava(seminar_id, prijava);
      res.locals.updatedDocument = seminar; // Store updated document for audit middleware
      res.status(201).json(seminar);
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
      const seminar = await deletePrijava(zaposleni_id as string, seminar_id as string);
      res.locals.updatedDocument = seminar; // Store updated document for audit middleware
      res.status(200).json(seminar);
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
      res.status(201).json(deletedSeminar);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
