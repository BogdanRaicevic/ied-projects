import { Router, Request, Response, NextFunction } from "express";
import { parse, format } from "date-fns";
import { saveSeminar, searchSeminari } from "../services/seminar.service";

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
  const { naziv, predavac, lokacija, datumOd, datumDo } = req.body;
  const parsedDatumOd = parse(datumOd, "yyyy-MM-dd", new Date());
  const formattedDatumOd = format(parsedDatumOd, "yyyy-MM-dd");
  const parsedDatumDo = parse(datumDo, "yyyy-MM-dd", new Date());
  const formattedDatumDo = format(parsedDatumDo, "yyyy-MM-dd");

  try {
    const result = await searchSeminari({
      naziv,
      predavac,
      lokacija,
      datumOd: formattedDatumOd,
      datumDo: formattedDatumDo,
    });
    console.log("Request Body:", req.body);
    console.log("Query Results:", result);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

export default router;
