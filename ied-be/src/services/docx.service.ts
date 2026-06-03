import fs from "node:fs";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import {
  IzdavacRacuna,
  type RacunType,
  type SertifikatTemplateKeyType,
  type SertifikatType,
} from "ied-shared";
import PizZip from "pizzip";
import puppeteer, { type Browser, type PDFOptions } from "puppeteer";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import {
  escapeHtml,
  formatToLocalDate,
  inlineLocalAsset,
  sanitizeFilename,
} from "../utils/docx.utils";

export type CertificatePdfVariant = "print" | "email";

const templatesDir = path.resolve(import.meta.dirname, "../templates");
const htmlTemplatesDir = path.resolve(templatesDir, "certificates");

// ---------------------------------------------------------------------------
// DOCX invoice generation
// ---------------------------------------------------------------------------

export const generateDocxBuffer = (
  templateName: string,
  racunData: RacunType,
): { buffer: Buffer; fileName: string } => {
  const sanitizedTemplateName = templateName.replace(/[^a-zA-Z0-9-_.]/g, "");
  if (sanitizedTemplateName !== templateName) {
    throw new Error("Invalid template name format");
  }

  const templatePath = path.resolve(
    templatesDir,
    sanitizedTemplateName.concat(".docx"),
  );

  if (!templatePath.startsWith(templatesDir)) {
    throw new Error("Invalid template path");
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    errorLogging: true,
  });

  const dataForDocumentRendering = {
    ...racunData,
    izdavacRacuna: {
      ...izdavacRacuna.find((d) => d.id === racunData.izdavacRacuna),
    },
    datumIzdavanjaRacuna: formatToLocalDate(new Date()),
    hasOnline: (racunData.seminar.brojUcesnikaOnline || 0) > 0,
    hasOffline: (racunData.seminar.brojUcesnikaOffline || 0) > 0,
    shouldRenderPdvBlock: racunData.izdavacRacuna !== IzdavacRacuna.PERMANENT,
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

  doc.render(dataForDocumentRendering);

  const buffer = doc.getZip().generate({ type: "nodebuffer" });
  const fileName = sanitizeFilename(
    `${racunData.pozivNaBroj}_${dataForDocumentRendering.primalacRacuna?.naziv}.docx`,
  );

  return { buffer, fileName };
};

// ---------------------------------------------------------------------------
// Certificate HTML templating
// ---------------------------------------------------------------------------

// Cache key = "<templateKey>:<variant>"
const cachedCertificateHtmlByTemplate = new Map<string, string>();

const buildCertificateHtmlBase = (
  templateKey: SertifikatTemplateKeyType,
  variant: CertificatePdfVariant,
): string => {
  const cacheKey = `${templateKey}:${variant}`;
  const cached = cachedCertificateHtmlByTemplate.get(cacheKey);
  if (cached) return cached;

  const templateDir = path.resolve(htmlTemplatesDir, templateKey);

  const htmlFileName =
    variant === "print" ? "certificate-print.html" : "certificate.html";
  const rawHtml = fs.readFileSync(
    path.resolve(templateDir, htmlFileName),
    "utf-8",
  );

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

  let html = rawHtml.replace(
    /<link rel="stylesheet" href="\.\/certificate\.css"\s*\/?>/,
    `<style>${baseCss}</style>`,
  );

  if (variant === "print") {
    const printCss = fs.readFileSync(
      path.resolve(templateDir, "certificate-print.css"),
      "utf-8",
    );
    html = html.replace(
      /<link rel="stylesheet" href="\.\/certificate-print\.css"\s*\/?>/,
      `<style>${printCss}</style>`,
    );
  } else {
    html = html.replace(
      /<link rel="stylesheet" href="\.\/certificate-print\.css"\s*\/?>/,
      "",
    );
  }

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

// ---------------------------------------------------------------------------
// Browser lifecycle and PDF rendering
// ---------------------------------------------------------------------------

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

const renderHtmlPdf = async (
  browser: Browser,
  htmlContent: string,
  pdfOptions: PDFOptions,
): Promise<Buffer> => {
  const page = await browser.newPage();
  try {
    await page.emulateMediaType("print");
    await page.setContent(htmlContent, { waitUntil: "load" });
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      ...pdfOptions,
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
};

export const renderHtmlToPdfBuffer = async (
  htmlContent: string,
  pdfOptions: PDFOptions = {},
): Promise<Buffer> => {
  const browser = await getBrowser();
  return renderHtmlPdf(browser, htmlContent, pdfOptions);
};

const renderCertificatePdf = async (
  browser: Browser,
  htmlContent: string,
): Promise<Buffer> => {
  return renderHtmlPdf(browser, htmlContent, {
    format: "A4",
    landscape: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
};

// ---------------------------------------------------------------------------
// ZIP assembly
// ---------------------------------------------------------------------------

const getSertifikatPdfFileName = (sertifikat: SertifikatType): string =>
  sanitizeFilename(
    `${sertifikat.ime_prezime}_${sertifikat.broj_sertifikata}.pdf`,
  );

export const generateCertificatesZipBuffer = async (
  sertifikatData: SertifikatType[],
): Promise<{ buffer: Buffer; fileName: string }> => {
  const browser = await getBrowser();
  const archive = new PizZip();

  for (const sertifikat of sertifikatData) {
    const fileName = getSertifikatPdfFileName(sertifikat);

    const printPdf = await renderCertificatePdf(
      browser,
      renderCertificateHtml(sertifikat, "print"),
    );
    archive.file(`stampa/${fileName}`, printPdf);

    const emailPdf = await renderCertificatePdf(
      browser,
      renderCertificateHtml(sertifikat, "email"),
    );
    archive.file(`email/${fileName}`, emailPdf);
  }

  const buffer = archive.generate({
    compression: "DEFLATE",
    type: "nodebuffer",
  });

  const fileName = `sertifikati_${new Date().toISOString().split("T")[0]}.zip`;

  return { buffer, fileName };
};
