import { Router, Request, Response, NextFunction } from "express";
import { saveSeminar, searchSeminari } from "../services/seminar.service";

const router = Router();

router.post("/save", async (req: Request, res: Response) => {
  const { naziv, predavac, lokacija } = req.body;
  try {
    saveSeminar({ naziv, predavac, lokacija });
    res.send({ success: true, message: "Seminar created" });
  } catch (error) {
    console.error("Error creating seminar:", error);
    res.status(500).send("Error creating seminar");
  }
});

router.post("/search", async (req, res) => {
  const { naziv, predavac, lokacija } = req.body;

  try {
    const result = await searchSeminari({ naziv, predavac, lokacija });
    res.send(result);
  } catch (error) {
    console.error("Error finding seminar", error);
    res.status(500).send("Error finding seminar");
  }
});

export default router;
