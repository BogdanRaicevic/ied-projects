import { Router, type Request, type Response, type NextFunction } from "express";
import { format } from "date-fns";
import {
  deletePrijava,
  deleteSeminar,
  getSeminarById,
  getAllSeminars,
  savePrijava,
  saveSeminar,
  search,
} from "../services/seminar.service";
import type { FilterQuery } from "mongoose";
import type { SeminarType } from "../models/seminar.model";
import type {
  SeminarQueryParams,
  SaveSeminarParams,
  PrijavaNaSeminar,
} from "@ied-shared/types/index";
import { ErrorWithCause } from "../utils/customErrors";

const router = Router();

interface SaveSeminar extends Request {
  body: SaveSeminarParams;
}

router.post("/save", async (req: SaveSeminar, res: Response, next: NextFunction) => {
  try {
    const seminar = await saveSeminar(req.body);
    res.status(201).json(seminar);
  } catch (error) {
    next(error);
  }
});

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  const { pageIndex = 1, pageSize = 10, ...query } = req.body;
  const { datumOd, datumDo, ...rest } = query as SeminarQueryParams;
  let formattedDatumOd = "";
  let formattedDatumDo = "";

  if (datumOd) {
    formattedDatumOd = format(datumOd, "yyyy-MM-dd");
  }
  if (datumDo) {
    formattedDatumDo = format(datumDo, "yyyy-MM-dd");
  }

  try {
    const paginationResult = await search(
      {
        ...rest,
        datumOd: formattedDatumOd,
        datumDo: formattedDatumDo,
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
});

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

interface SavePrijava extends Request {
  body: PrijavaNaSeminar;
}

router.post("/save-prijava", async (req: SavePrijava, res: Response, next: NextFunction) => {
  try {
    const seminar = await savePrijava(req.body);
    res.status(201).json(seminar);
  } catch (error: unknown) {
    if (error instanceof ErrorWithCause && error.code === "duplicate") {
      res.status(409).json({ message: error.message });
    } else {
      next(error);
    }
  }
});

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
