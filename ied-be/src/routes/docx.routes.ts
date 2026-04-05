import fs from "node:fs";
import path from "node:path";
import { formatDate } from "date-fns";
import Docxtemplater from "docxtemplater";
import { type Request, Router } from "express";
import {
  IzdavacRacuna,
  type RacunType,
  RacunZod,
  SertifikatBatchZod,
  type SertifikatTemplateKeyType,
  SertifikatTemplateKeyValues,
  type SertifikatType,
  SertifikatZod,
  TipRacuna,
} from "ied-shared";
import PizZip from "pizzip";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import { validateRequestBody } from "../middleware/validateSchema";

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
  let sanitized = str.replace(
    /[šŠđĐčČćĆžŽ]/g,
    (char) => serbianChars[char] || char,
  );
  // Remove or replace problematic characters (except underscore, dash, and dot for extension)
  sanitized = sanitized.replace(/[^a-zA-Z0-9-_.]/g, "_");
  // Replace multiple underscores with a single underscore
  sanitized = sanitized.replace(/_+/g, "_");
  // Remove trailing dots (except for extension)
  sanitized = sanitized.replace(/\.+(?=\.)/g, "");
  return sanitized;
};

const formatToLocalDate = (date: Date): string =>
  formatDate(date, "dd.MM.yyyy");

const templatesDir = path.resolve(import.meta.dirname, "../../src/templates");

const getTemplatePath = (templateName: string): string => {
  const templatePath = path.resolve(templatesDir, templateName);
  if (!templatePath.startsWith(templatesDir)) {
    throw new Error("Invalid template path");
  }
  return templatePath;
};

const getTemplateErrorDetails = (error: unknown): string => {
  let errorDetails = error instanceof Error ? error.message : "Unknown error";
  if (error && typeof error === "object" && "properties" in error) {
    const err = error as {
      properties?: {
        errors?: Array<{
          name?: string;
          message?: string;
          properties?: { id?: string };
        }>;
      };
    };
    if (err.properties?.errors) {
      errorDetails = err.properties.errors
        .map(
          (e) =>
            `${e.name || "Error"}: ${e.message || ""} (${e.properties?.id || "unknown"})`,
        )
        .join("; ");
    }
  }
  return errorDetails;
};

const renderDocxTemplate = (
  templatePath: string,
  templateData: Record<string, unknown>,
): Buffer => {
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    errorLogging: true,
  });

  doc.render(templateData);

  return doc.getZip().generate({ type: "nodebuffer" });
};

const getCurrentYearLastTwoDigits = (): string =>
  String(new Date().getFullYear()).slice(-2);

const getSertifikatDocxFileName = (sertifikat: SertifikatType): string => {
  const currentYearLastTwoDigits = getCurrentYearLastTwoDigits();
  return sanitizeFilename(
    `${sertifikat.broj_sertifikata}${currentYearLastTwoDigits}_${sertifikat.ime_prezime}_${sertifikat.firma_naziv}.docx`,
  );
};

const sertifikatTemplatePathMap: Record<SertifikatTemplateKeyType, string> = {
  bs: "certificates/bs.docx",
  ied: "certificates/ied.docx",
  perm: "certificates/perm.docx",
};

const resolveSertifikatTemplatePath = (
  templateKey: SertifikatTemplateKeyType,
): string => {
  const templateFileName = sertifikatTemplatePathMap[templateKey];

  if (!templateFileName) {
    throw new Error(
      `Nepodržan šablon sertifikata. Dozvoljene vrednosti su: ${SertifikatTemplateKeyValues.join(", ")}`,
    );
  }

  const templatePath = getTemplatePath(templateFileName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Template file not found for certificate template: ${templateKey}`,
    );
  }

  // TODO: Remove this after testing
  return templatePath.replace("ied.docx", "ied_regal_blue.docx");
};

router.post(
  "/modify-template",
  validateRequestBody(RacunZod),
  async (req: Request<{}, any, RacunType>, res) => {
    // Validate template name if you want to support multiple templates
    const templateName = req.body.tipRacuna;
    const racunData = req.body;

    // Check if the racunType is valid
    if (!Object.values(TipRacuna).includes(templateName as TipRacuna)) {
      res.status(400).json({
        error: "Invalid template name",
        validTypes: Object.values(TipRacuna),
      });
      return;
    }

    // Sanitize the template name to prevent path traversal
    const sanitizedTemplateName = templateName.replace(/[^a-zA-Z0-9-_.]/g, "");
    if (sanitizedTemplateName !== templateName) {
      res.status(400).json({ error: "Invalid template name format" });
      return;
    }

    const templatePath = path.resolve(
      templatesDir,
      sanitizedTemplateName.concat(".docx"),
    );

    // Additional check to ensure the resolved path is within the templates directory
    if (!templatePath.startsWith(templatesDir)) {
      res.status(400).json({ error: "Invalid template path" });
      return;
    }

    try {
      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        errorLogging: true,
      });

      const dataForDocumentRednering = {
        ...racunData,
        izdavacRacuna: {
          ...izdavacRacuna.find((d) => d.id === req.body.izdavacRacuna),
        },
        datumIzdavanjaRacuna: formatToLocalDate(new Date()),
        hasOnline: (req.body.seminar.brojUcesnikaOnline || 0) > 0,
        hasOffline: (req.body.seminar.brojUcesnikaOffline || 0) > 0,
        shouldRenderPdvBlock:
          racunData.izdavacRacuna !== IzdavacRacuna.PERMANENT,
        seminar: {
          ...(racunData.seminar ?? {}),
          datum: racunData.seminar?.datum
            ? formatToLocalDate(new Date(racunData.seminar.datum))
            : undefined,
        },
        datumUplateAvansa: formatToLocalDate(
          racunData.datumUplateAvansa || new Date(),
        ),
      };

      doc.render(dataForDocumentRednering);

      const buf = doc.getZip().generate({ type: "nodebuffer" });

      // Set appropriate headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );

      const fileName = sanitizeFilename(
        `${racunData.pozivNaBroj}_${dataForDocumentRednering.primalacRacuna?.naziv}.docx`,
      );
      res.setHeader(`Content-Disposition`, `attachment; filename=${fileName}`);

      res.send(buf);
    } catch (error) {
      console.error("Template processing error:", error);
      // Docxtemplater multi-error handling
      let errorDetails =
        error instanceof Error ? error.message : "Unknown error";
      if (error && typeof error === "object" && "properties" in error) {
        const err = error as {
          properties?: {
            errors?: Array<{
              name?: string;
              message?: string;
              properties?: { id?: string };
            }>;
          };
        };
        if (err.properties?.errors) {
          errorDetails = err.properties.errors
            .map(
              (e) =>
                `${e.name || "Error"}: ${e.message || ""} (${e.properties?.id || "unknown"})`,
            )
            .join("; ");
        }
      }
      res.status(500).json({
        error: "Error processing template",
        details: errorDetails,
      });
    }
  },
);

router.post(
  "/generate-sertifikat-single",
  validateRequestBody(SertifikatZod),
  async (req: Request<{}, any, SertifikatType>, res) => {
    const sertifikatData = req.body;
    const templatePath = resolveSertifikatTemplatePath(
      sertifikatData.templateKey,
    );
    console.log("templatePath", templatePath);

    try {
      const docxBuffer = renderDocxTemplate(templatePath, sertifikatData);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${getSertifikatDocxFileName(sertifikatData)}`,
      );

      res.send(docxBuffer);
    } catch (error) {
      console.error("Template processing error:", error);
      res.status(500).json({
        error: "Error processing template",
        details: getTemplateErrorDetails(error),
      });
    }
  },
);

router.post(
  "/generate-sertifikat",
  validateRequestBody(SertifikatBatchZod),
  async (req: Request<{}, any, SertifikatType[]>, res) => {
    const sertifikatData = req.body;

    const selectedTemplateKey = sertifikatData[0]?.templateKey;
    if (!selectedTemplateKey) {
      res.status(400).json({
        error: "Template key is required for certificate generation",
      });
      return;
    }

    const templatePath = resolveSertifikatTemplatePath(selectedTemplateKey);

    try {
      const archive = new PizZip();
      const currentYearLastTwoDigits = getCurrentYearLastTwoDigits();

      for (const sertifikat of sertifikatData) {
        const docxBuffer = renderDocxTemplate(templatePath, sertifikat);
        const fileName = getSertifikatDocxFileName(sertifikat);

        archive.file(fileName, docxBuffer);
      }

      const zipBuffer = archive.generate({
        compression: "DEFLATE",
        type: "nodebuffer",
      });

      res.setHeader("Content-Type", "application/zip");
      const fileName = sanitizeFilename(
        `Sertifikati_${currentYearLastTwoDigits}_${sertifikatData[0]?.seminar_naziv || "IED"}.zip`,
      );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      res.send(zipBuffer);
    } catch (error) {
      console.error("Template processing error:", error);
      res.status(500).json({
        error: "Error processing template",
        details: getTemplateErrorDetails(error),
      });
    }
  },
);

export default router;
