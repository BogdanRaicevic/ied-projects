import { Router } from "express";
import { ExtendedSearchRacunZod, RacunQueryZod, RacunZod } from "ied-shared";
import { validateRequestBody } from "../middleware/validateSchema";
import {
  getRacunById,
  getRacunByPozivNaBrojAndIzdavac,
  saveRacun,
  searchRacuni,
  updateRacunById,
} from "../services/racuni.service";

const router = Router();

router.post(
  "/search",
  validateRequestBody(ExtendedSearchRacunZod),
  async (req, res) => {
    const { pageIndex, pageSize, ...queryParameters } = req.body;

    const result = await searchRacuni(pageIndex, pageSize, queryParameters);
    res.json(result);
  },
);

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const racun = await getRacunById(id);
  if (!racun) {
    res.status(404).send("Racun not found");
    return;
  }
  res.json(racun);
});

router.post("/save", validateRequestBody(RacunZod), async (req, res) => {
  const result = await saveRacun(req.body);
  res.json(result || []);
});

router.put("/update/:id", validateRequestBody(RacunZod), async (req, res) => {
  const { id } = req.params;
  const racun = req.body;
  const result = await updateRacunById(id, racun);
  if (!result) {
    res.status(404).send("Racun not found");
    return;
  }
  res.json(result);
});

router.get("/", async (req, res) => {
  const { pozivNaBroj, izdavacRacuna, tipRacuna } = RacunQueryZod.parse(
    req.query,
  );
  const racun = await getRacunByPozivNaBrojAndIzdavac(
    pozivNaBroj,
    izdavacRacuna,
    tipRacuna,
  );
  if (!racun) {
    res.status(404).send("Racun not found");
    return;
  }
  res.json(racun);
});

export default router;
