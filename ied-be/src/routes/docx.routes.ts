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
  type SertifikatType,
  TipRacuna,
} from "ied-shared";
import PizZip from "pizzip";
import puppeteer, { type Browser } from "puppeteer";
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

const getCurrentYearLastTwoDigits = (): string =>
  String(new Date().getFullYear()).slice(-2);

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
      const details = getTemplateErrorDetails(error);
      res.status(500).json({
        error: "Error processing template",
        details,
      });
    }
  },
);

const htmlTemplatesDir = path.resolve(templatesDir, "certificates");

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type CertificatePdfVariant = "print" | "email";

// Cache key = "<templateKey>:<variant>"
const cachedCertificateHtmlByTemplate = new Map<string, string>();

const mimeTypeForExt: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  gif: "image/gif",
  webp: "image/webp",
};

const inlineLocalAsset = (assetPath: string): string | null => {
  if (!fs.existsSync(assetPath)) return null;
  const ext = path.extname(assetPath).toLowerCase().slice(1);
  const mime = mimeTypeForExt[ext] ?? "application/octet-stream";
  const base64 = fs.readFileSync(assetPath).toString("base64");
  return `data:${mime};base64,${base64}`;
};

const buildCertificateHtmlBase = (
  templateKey: SertifikatTemplateKeyType,
  variant: CertificatePdfVariant,
): string => {
  const cacheKey = `${templateKey}:${variant}`;
  const cached = cachedCertificateHtmlByTemplate.get(cacheKey);
  if (cached) return cached;

  const templateDir = path.resolve(htmlTemplatesDir, templateKey);

  const rawHtml = fs.readFileSync(
    path.resolve(templateDir, "certificate-print.html"),
    "utf-8",
  );

  // Inline local url() references in CSS before embedding the stylesheet
  let baseCss = fs.readFileSync(
    path.resolve(templateDir, "certificate.css"),
    "utf-8",
  );
  baseCss = baseCss.replace(
    /url\(["']?\.\/([^"')]+)["']?\)/g,
    (match, filename: string) => {
      const dataUrl = inlineLocalAsset(path.resolve(templateDir, filename));
      return dataUrl ? `url("${dataUrl}")` : match;
    },
  );

  // Replace <link> tags with inlined <style> blocks
  let html = rawHtml.replace(
    /<link rel="stylesheet" href="\.\/certificate\.css"\s*\/?>/,
    `<style>${baseCss}</style>`,
  );

  if (variant === "print") {
    // Include print CSS — strips background gradient, good for physical printing
    const printCss = fs.readFileSync(
      path.resolve(templateDir, "certificate-print.css"),
      "utf-8",
    );
    html = html.replace(
      /<link rel="stylesheet" href="\.\/certificate-print\.css"\s*\/?>/,
      `<style>${printCss}</style>`,
    );
  } else {
    // Email variant — drop the print CSS link so the gradient background is kept
    html = html.replace(
      /<link rel="stylesheet" href="\.\/certificate-print\.css"\s*\/?>/,
      "",
    );
  }

  // Inline all local <img src="./..."> references
  html = html.replace(
    /src="\.\/([^"]+\.(png|svg|jpg|jpeg|gif|webp))"/gi,
    (match, filename: string) => {
      const dataUrl = inlineLocalAsset(path.resolve(templateDir, filename));
      return dataUrl ? `src="${dataUrl}"` : match;
    },
  );

  cachedCertificateHtmlByTemplate.set(cacheKey, html);
  return html;
};

const renderCertificateHtml = (
  sertifikat: SertifikatType,
  variant: CertificatePdfVariant,
): string => {
  const base = buildCertificateHtmlBase(sertifikat.templateKey, variant);
  const replacements: Record<string, string> = {
    __BROJ_SERTIFIKATA__: escapeHtml(String(sertifikat.broj_sertifikata)),
    __GODINA_SEMINARA__: escapeHtml(sertifikat.godina_seminara),
    __IME_PREZIME__: escapeHtml(sertifikat.ime_prezime),
    __SEMINAR_NAZIV__: escapeHtml(sertifikat.seminar_naziv),
    __DATUM_SEMINARA__: escapeHtml(sertifikat.datum_seminara),
    __TEMPLATE_KEY__: escapeHtml(sertifikat.templateKey),
  };

  return Object.entries(replacements).reduce(
    (html, [token, value]) => html.replaceAll(token, value),
    base,
  );
};

const getSertifikatPdfFileName = (sertifikat: SertifikatType): string => {
  const currentYearLastTwoDigits = getCurrentYearLastTwoDigits();
  return sanitizeFilename(
    `${sertifikat.broj_sertifikata}${currentYearLastTwoDigits}_${sertifikat.ime_prezime}_${sertifikat.firma_naziv}.pdf`,
  );
};

let browserPromise: Promise<Browser> | null = null;

const getBrowser = async (): Promise<Browser> => {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
      .then((browser) => {
        browser.once("disconnected", () => {
          browserPromise = null;
        });
        return browser;
      })
      .catch((error) => {
        browserPromise = null;
        throw error;
      });
  }

  return browserPromise;
};

const renderCertificatePdf = async (
  browser: Browser,
  sertifikat: SertifikatType,
  variant: CertificatePdfVariant,
): Promise<Buffer> => {
  const page = await browser.newPage();
  try {
    // Use print media so @media screen padding/shadow rules are suppressed
    await page.emulateMediaType("print");
    await page.setContent(renderCertificateHtml(sertifikat, variant), {
      waitUntil: "load",
    });
    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
};

router.post(
  "/generate-pdf-files",
  validateRequestBody(SertifikatBatchZod),
  async (req: Request<{}, any, SertifikatType[]>, res) => {
    const sertifikatData = req.body;

    try {
      const browser = await getBrowser();
      const archive = new PizZip();
      const currentYearLastTwoDigits = getCurrentYearLastTwoDigits();

      for (const sertifikat of sertifikatData) {
        const fileName = getSertifikatPdfFileName(sertifikat);

        const printPdf = await renderCertificatePdf(
          browser,
          sertifikat,
          "print",
        );
        archive.file(`stampa/${fileName}`, printPdf);

        const emailPdf = await renderCertificatePdf(
          browser,
          sertifikat,
          "email",
        );
        archive.file(`email/${fileName}`, emailPdf);
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
      console.error("PDF certificate generation error:", error);
      res.status(500).json({
        error: "Error generating PDF certificates",
        details: getTemplateErrorDetails(error),
      });
    }
  },
);

export default router;
