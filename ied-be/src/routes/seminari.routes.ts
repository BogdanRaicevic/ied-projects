import { Router, type Request, type Response, type NextFunction, query } from "express";
import { format } from "date-fns";
import {
  deletePrijava,
  deleteSeminar,
  getSeminarById,
  getAllSeminars,
  savePrijava,
  saveSeminar,
  searchSeminars,
} from "../services/seminar.service";
import type { FilterQuery } from "mongoose";
import type { SeminarType } from "../models/seminar.model";
import type { PrijavaZodType, SeminarQueryParamsZodType } from "@ied-shared/types/seminar";
import { ErrorWithCause } from "../utils/customErrors";
import { validate } from "../middleware/validateSchema";
import { PrijavaSchema, SeminarQueryParamsSchema, SeminarSchema } from "@ied-shared/types/seminar";
import { z } from "zod";

const router = Router();

router.post(
  "/save",
  validate(SeminarSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const seminar = await saveSeminar(req.body);
      res.status(201).json(seminar);
    } catch (error) {
      next(error);
    }
  }
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
    const { datumOd, datumDo, ...rest } = query as SeminarQueryParamsZodType;

    console.log("serch", query);
    try {
      const paginationResult = await searchSeminars(
        {
          ...rest,
          datumOd,
          datumDo,
        } as FilterQuery<SeminarType>,
        Number(pageIndex),
        Number(pageSize)
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
  }
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

const SavePrijavaInputSchema = PrijavaSchema.extend({
  seminar_id: z.string(),
});

router.post(
  "/save-prijava",
  validate(SavePrijavaInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { seminar_id, ...prijava } = req.body as z.infer<typeof SavePrijavaInputSchema>;
    try {
      const seminar = await savePrijava(seminar_id, prijava);
      res.status(201).json(seminar);
    } catch (error: unknown) {
      if (error instanceof ErrorWithCause && error.code === "duplicate") {
        res.status(409).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }
);

router.delete("/delete-prijava", async (req: Request, res: Response, next: NextFunction) => {
  const { zaposleni_id, seminar_id } = req.query;
  try {
    const seminar = await deletePrijava(zaposleni_id as string, seminar_id as string);
    res.status(200).json(seminar);
  } catch (error) {
    next(error);
  }
});

router.delete("/delete/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedSeminar = await deleteSeminar(req.params.id);
    res.status(201).json(deletedSeminar);
  } catch (error) {
    next(error);
  }
});

export default router;
