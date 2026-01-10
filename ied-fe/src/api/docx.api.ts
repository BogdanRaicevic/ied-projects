import { type RacunType, RacunZod, TipRacuna } from "ied-shared";
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

    // Check if the response is an error message
    if (response.headers["content-type"]?.includes("application/json")) {
      const errorData = JSON.parse(await response.data.text());
      throw new Error(errorData.error || "Failed to generate document");
    }

    // Create and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Try to get filename from Content-Disposition header
    let fileName = "document.docx";
    const disposition = response.headers["content-disposition"];
    if (disposition?.includes("filename=")) {
      const match = disposition.match(/filename=["']?([^"';\n]+)["']?/);
      if (match?.[1]) {
        fileName = match[1];
      }
    } else {
      // fallback if header is missing
      fileName = `${racunData.pozivNaBroj}_${sanitizeFilename(racunData.primalacRacuna.naziv)}.docx`;
    }

    link.setAttribute("download", `${fileName}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Generate racun API eror:", error);
    throw error;
  }
};

const sanitizeFilename = (str: string) => {
  if (!str) return "";
  // Remove characters that may cause issues in filenames and headers
  return str
    .trim()
    .replace(/[^\w\s.-]/g, "_") // Replace non-alphanumeric chars except for some safe ones
    .replace(/\s+/g, "_"); // Replace spaces with underscores
};
