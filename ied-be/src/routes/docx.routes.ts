import { Router, Request } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import { validate } from "../middleware/validateSchema";
import { RacunZod, RacunSchema, TipRacuna, IzdavacRacuna } from "@ied-shared/types/racuni.zod";
import { formatDate } from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const sanitizeFilename = (str: string): string => {
  if (str.length > 255) {
    throw new Error("Filename is too long");
  }
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
  // Replace Serbian characters
  let sanitized = str.replace(/[šŠđĐčČćĆžŽ]/g, (char) => serbianChars[char] || char);
  // Remove or replace problematic characters (except underscore, dash, and dot for extension)
  sanitized = sanitized.replace(/[^a-zA-Z0-9-_\.]/g, "_");
  // Replace multiple underscores with a single underscore
  sanitized = sanitized.replace(/_+/g, "_");
  // Remove trailing dots (except for extension)
  sanitized = sanitized.replace(/\.+(?=\.)/g, "");
  return sanitized;
};

const formatToLocalDate = (date: Date): string => formatDate(date, "dd.MM.yyyy");

router.post(
  "/modify-template",
  validate(RacunSchema),
  async (req: Request<{}, any, RacunZod>, res) => {
    // Validate template name if you want to support multiple templates
    const templateName = req.body.tipRacuna;
    const racunData = req.body;

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

    try {
      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip);

      const dataForDocumentRednering = {
        ...racunData,
        izdavacRacuna: { ...izdavacRacuna.find((d) => d.id === req.body.izdavacRacuna) },
        datumIzdavanjaRacuna: formatToLocalDate(new Date()),
        hasOnline: (req.body.seminar.brojUcesnikaOnline || 0) > 0,
        hasOffline: (req.body.seminar.brojUcesnikaOffline || 0) > 0,
        shouldRenderPdvBlock: racunData.izdavacRacuna !== IzdavacRacuna.PERMANENT,
        seminar: {
          ...(racunData.seminar ?? {}),
          datum: racunData.seminar?.datum
            ? formatToLocalDate(new Date(racunData.seminar.datum))
            : undefined,
        },
        datumUplateAvansa: formatToLocalDate(racunData.datumUplateAvansa || new Date()),
      };

      doc.render(dataForDocumentRednering);

      const buf = doc.getZip().generate({ type: "nodebuffer" });

      // Set appropriate headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      const fileName = sanitizeFilename(
        `${racunData.pozivNaBroj}_${dataForDocumentRednering.primalacRacuna?.naziv}.docx`
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
  }
);

export default router;
