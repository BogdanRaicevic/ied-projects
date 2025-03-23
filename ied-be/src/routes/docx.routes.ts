import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const router = Router();

router.post("/modify-template", async (req, res, next) => {
  const flattenedData = {
    ...req.body,
    izdavacRacunaNaziv: req.body.izdavacRacuna?.naziv || "",
    izdavacRacunaKontaktTelefoni: req.body.izdavacRacuna?.kontaktTelefoni?.join(", ") || "",
    izdavacRacunaPib: req.body.izdavacRacuna?.pib || "",
    izdavacRacunaMaticniBroj: req.body.izdavacRacuna?.maticniBroj || "",
    izdavacRacunaBrojResenja: req.body.izdavacRacuna?.brojResenjaOEvidencijiZaPDV || "",
    izdavacRacunaTekuciRacun: req.body.izdavacRacuna?.tekuciRacun || "",
    datumIzdavanjaRacuna: new Date().toLocaleDateString("sr-RS"),
    hasOnline: Number(req.body.brojUcesnikaOnline) > 0,
    hasOffline: Number(req.body.brojUcesnikaOffline) > 0,
  };

  console.log("flattenedData", flattenedData);

  const content = fs.readFileSync(
    path.resolve(__dirname, "../templates/template_1.docx"),
    "binary"
  );

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip);

  try {
    doc.render(flattenedData);
  } catch (error) {
    console.error("Template rendering error:", error);
    next(error);
  }

  const buf = doc.getZip().generate({ type: "nodebuffer" });
  res.send(buf);
});

export default router;
