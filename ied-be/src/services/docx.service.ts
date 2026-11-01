import fs from "node:fs";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import { IzdavacRacuna, type RacunType } from "ied-shared";
import PizZip from "pizzip";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import { formatToLocalDate, sanitizeFilename } from "../utils/docx.utils";

const templatesDir = path.resolve(import.meta.dirname, "../templates");

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
