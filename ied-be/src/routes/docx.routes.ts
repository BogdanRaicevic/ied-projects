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
  try {
    // Validate template name if you want to support multiple templates
    const templateName = req.body.racunType;

    // Check if the racunType is valid
    if (!Object.values(RacunTypes).includes(req.body.racunType)) {
      return res.status(400).json({
        error: "Invalid template name",
        validTypes: Object.values(RacunTypes),
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

    // Additional check to ensure the resolved path is within the templates directory
    const templatesDir = path.resolve(__dirname, "../../src/templates");
    if (!templatePath.startsWith(templatesDir)) {
      return res.status(400).json({ error: "Invalid template path" });
    }

    const flattenedData = {
      ...req.body,
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
      `${sanitizedTemplateName}_${flattenedData.naziv.trim()}_${flattenedData.nazivSeminara.trim()}_${new Date().toISOString().split("T")[0].replace(/-/g, "")}.docx`
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
