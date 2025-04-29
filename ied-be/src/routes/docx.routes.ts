import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveRacun } from "../services/racuni.service";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import { validate } from "../middleware/validateSchema";
import { RacunSchema, TipRacuna } from "@ied-shared/types/racuni";

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

router.post("/modify-template", validate(RacunSchema), async (req, res) => {
  // Validate template name if you want to support multiple templates
  const templateName = req.body.tipRacuna;

  console.log("templateName", templateName);

  // Check if the racunType is valid
  if (!Object.values(TipRacuna).includes(templateName as TipRacuna)) {
    return res.status(400).json({
      error: "Invalid template name",
      validTypes: Object.values(TipRacuna),
    });
  }

  // Sanitize the template name to prevent path traversal
  const sanitizedTemplateName = templateName.replace(/[^a-zA-Z0-9-_.]/g, "");
  if (sanitizedTemplateName !== templateName) {
    return res.status(400).json({ error: "Invalid template name format" });
  }

  const templatePath = path.resolve(
    __dirname,
    "../../src/templates",
    sanitizedTemplateName.concat(".docx")
  );

  console.log("templatePath", templatePath);

  // Additional check to ensure the resolved path is within the templates directory
  const templatesDir = path.resolve(__dirname, "../../src/templates");
  if (!templatePath.startsWith(templatesDir)) {
    return res.status(400).json({ error: "Invalid template path" });
  }

  const racunData = {
    ...req.body,
    datumIzdavanjaRacuna: new Date(),
    hasOnline: Number(req.body.seminar.brojUcesnikaOnline) > 0,
    hasOffline: Number(req.body.seminar.brojUcesnikaOffline) > 0,
  };

  console.log("racunData", racunData);
  await saveRacun(racunData);
  try {
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);

    const dataForDocumentRednering = {
      ...racunData,
      izdavacRacuna: { ...izdavacRacuna.find((d) => d.id === req.body.izdavacRacuna) },
    };

    doc.render(dataForDocumentRednering);

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // Set appropriate headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const fileName = sanitizeFilename(
      `${sanitizedTemplateName}_${racunData.primalacRacuna.naziv.trim()}_${racunData.seminar.naziv.trim()}_${new Date().toISOString().split("T")[0].replace(/-/g, "")}.docx`
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
