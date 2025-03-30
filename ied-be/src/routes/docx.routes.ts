import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { RacunTypes } from "@ied-shared/constants/racun";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const sanitizeFilename = (str: string): string => {
  const serbianChars: { [key: string]: string } = {
    š: "s",
    Š: "S",
    đ: "dj",
    Đ: "Dj",
    č: "c",
    Č: "C",
    ć: "c",
    Ć: "C",
    ž: "z",
    Ž: "Z",
  };
  return str.replace(/[šŠđĐčČćĆžŽ]/g, (char) => serbianChars[char] || char);
};

router.post("/modify-template", async (req, res) => {
  const templatesMap = new Map<RacunTypes, string>([
    [RacunTypes.PREDRACUN, "predracun.docx"],
    [RacunTypes.AVANSNI_RACUN, "avansni_racun.docx"],
    [RacunTypes.KONACNI_RACUN, "konacni_racun.docx"],
    [RacunTypes.RACUN, "racun.docx"],
  ]);

  try {
    // Validate template name if you want to support multiple templates
    const templateName = templatesMap.get(req.body.racunType);
    console.log("templateName", templateName);
    if (!templateName) {
      return res.status(400).json({ error: "Invalid template name" });
    }

    const templatePath = path.resolve(__dirname, "../../storage/templates", templateName);

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template not found" });
    }

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
      sadasnjaGodina: new Date().getFullYear().toString().slice(-2),
    };

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);

    doc.render(flattenedData);

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // Set appropriate headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const fileName = sanitizeFilename(
      `racun_${flattenedData.naziv.trim()}_${flattenedData.nazivSeminara.trim()}_${new Date().toISOString().split("T")[0].replace(/-/g, "")}.docx`
    );
    console.log("fileName", fileName);
    res.setHeader(`Content-Disposition`, `attachment; filename=${fileName}`);

    res.send(buf);
  } catch (error) {
    console.error("Template processing error:", error);
    res.status(500).json({
      error: "Error processing template",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
