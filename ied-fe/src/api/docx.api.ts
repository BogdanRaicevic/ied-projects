import {
  type RacunType,
  RacunZod,
  type SertifikatType,
  TipRacuna,
} from "ied-shared";
import { validateOrThrow } from "../utils/zodErrorHelper";
import axiosInstanceWithAuth from "./interceptors/auth";

export const generateRacunDocument = async (racunData: RacunType) => {
  const tipRacuna = racunData.tipRacuna;
  if (!Object.values(TipRacuna).includes(tipRacuna)) {
    throw new Error(
      `Tip računa ${racunData.tipRacuna} nije podržan za generisanje dokumenata.`,
    );
  }

  try {
    validateOrThrow(RacunZod, racunData);

    const response = await axiosInstanceWithAuth.post(
      `/api/docx/modify-template`,
      racunData,
      {
        responseType: "blob",
      },
    );

    await throwBlobResponseError(
      response.data,
      response.headers["content-type"],
      "Failed to generate document",
    );

    triggerBlobDownload(
      response.data,
      response.headers["content-disposition"],
      `${racunData.pozivNaBroj}_${sanitizeFilename(racunData.primalacRacuna.naziv)}.docx`,
    );
  } catch (error) {
    console.error("Generate racun API eror:", error);
    throw error;
  }
};

export const generateSertifikatDocument = async (
  sertifikatData: SertifikatType[],
) => {
  const response = await axiosInstanceWithAuth.post(
    `/api/docx/generate-sertifikat`,
    sertifikatData,
    {
      responseType: "blob",
    },
  );

  await throwBlobResponseError(
    response.data,
    response.headers["content-type"],
    "Failed to generate certificates",
  );

  triggerBlobDownload(
    response.data,
    response.headers["content-disposition"],
    "sertifikati.zip",
  );
};

export const generateSingleSertifikatDocument = async (
  sertifikatData: SertifikatType,
) => {
  const response = await axiosInstanceWithAuth.post(
    `/api/docx/generate-sertifikat-single`,
    sertifikatData,
    {
      responseType: "blob",
    },
  );

  await throwBlobResponseError(
    response.data,
    response.headers["content-type"],
    "Failed to generate certificate",
  );

  triggerBlobDownload(
    response.data,
    response.headers["content-disposition"],
    `${sertifikatData.broj_sertifikata}${sertifikatData.godina_sertifikata}_${sanitizeFilename(sertifikatData.ime_prezime)}_${sanitizeFilename(sertifikatData.firma_naziv)}.docx`,
  );
};

const headerToString = (headerValue: unknown): string | undefined =>
  typeof headerValue === "string" ? headerValue : undefined;

const triggerBlobDownload = (
  data: BlobPart,
  contentDispositionHeader: unknown,
  fallbackFileName = "download.bin",
) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    getFileNameFromDisposition(contentDispositionHeader) || fallbackFileName,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getFileNameFromDisposition = (contentDispositionHeader: unknown) => {
  const disposition = headerToString(contentDispositionHeader);
  if (!disposition) {
    return null;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;\n]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const standardMatch = disposition.match(/filename=["']?([^"';\n]+)["']?/i);
  return standardMatch?.[1] || null;
};

const throwBlobResponseError = async (
  data: Blob,
  contentTypeHeader: unknown,
  fallbackMessage: string,
) => {
  const contentType = headerToString(contentTypeHeader);
  if (!contentType?.includes("application/json")) {
    return;
  }

  const errorData = JSON.parse(await data.text());
  throw new Error(
    errorData.details ||
      errorData.error ||
      errorData.message ||
      fallbackMessage,
  );
};

const sanitizeFilename = (str: string) => {
  if (!str) return "";
  // Remove characters that may cause issues in filenames and headers
  return str
    .trim()
    .replace(/[^\w\s.-]/g, "_") // Replace non-alphanumeric chars except for some safe ones
    .replace(/\s+/g, "_"); // Replace spaces with underscores
};
