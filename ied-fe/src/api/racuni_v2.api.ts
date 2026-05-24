import axios from "axios";
import type { RacunV2Form } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const generateAndDownloadRacunV2Pdf = async (
  racunData: RacunV2Form,
): Promise<void> => {
  try {
    const response = await axiosInstanceWithAuth.post<Blob>(
      "/api/racuni-v2/generate",
      racunData,
      {
        responseType: "blob",
      },
    );

    await throwBlobResponseError(
      response.data,
      response.headers["content-type"],
      "Failed to generate Racun V2 PDF",
    );

    triggerBlobDownload(
      response.data,
      response.headers["content-disposition"],
      getFallbackFileName(racunData),
    );
  } catch (error) {
    console.error("Racun V2 PDF generation request error:", error);
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      await throwBlobResponseError(
        error.response.data,
        error.response.headers?.["content-type"],
        "Failed to generate Racun V2 PDF",
      );
    }
    throw error;
  }
};

const headerToString = (headerValue: unknown): string | undefined =>
  typeof headerValue === "string" ? headerValue : undefined;

const triggerBlobDownload = (
  data: Blob,
  contentDispositionHeader: unknown,
  fallbackFileName: string,
) => {
  const contentType = headerToString(data.type) ?? "application/pdf";
  const url = window.URL.createObjectURL(
    new Blob([data], { type: contentType }),
  );
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

const getFallbackFileName = (racunData: RacunV2Form): string => {
  const primalac = racunData.primalacRacuna;
  const primalacNaziv =
    primalac.tipPrimaoca === "firma" ? primalac.naziv : primalac.imeIPrezime;

  return `${sanitizeFilename(racunData.pozivNaBroj || "predracun")}_${sanitizeFilename(primalacNaziv || "primalac")}.pdf`;
};

const sanitizeFilename = (str: string) => {
  return str
    .trim()
    .replace(/[^\w\s.-]/g, "_")
    .replace(/\s+/g, "_");
};
