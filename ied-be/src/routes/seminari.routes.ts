import { Router, Request, Response, NextFunction } from "express";
import { parse, format } from "date-fns";
import { saveSeminar, search } from "../services/seminar.service";
import { FilterQuery } from "mongoose";
import { SeminarType } from "../models/seminar.model";

const router = Router();

router.post("/save", async (req: Request, res: Response, next: NextFunction) => {
  const { naziv, predavac, lokacija, cena, datum } = req.body;
  try {
    saveSeminar({ naziv, predavac, lokacija, cena, datum });
    res.send({ success: true, message: "Seminar created" });
  } catch (error) {
    next(error);
  }
});

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  const { pageIndex = 1, pageSize = 10, ...query } = req.body;
  const { datumOd, datumDo, ...rest } = query;
  let formattedDatumOd: string = "";
  let formattedDatumDo: string = "";

  if (datumOd) {
    const parsedDatumOd = parse(datumOd, "yyyy-MM-dd", new Date());
    formattedDatumOd = format(parsedDatumOd, "yyyy-MM-dd");
  }
  if (datumDo) {
    const parsedDatumDo = parse(datumDo, "yyyy-MM-dd", new Date());
    formattedDatumDo = format(parsedDatumDo, "yyyy-MM-dd");
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

export default router;
