import axiosInstanceWithAuth from "./interceptors/auth";
import { env } from "../utils/envVariables";
import type { Racun } from "../components/Racun/types";
import { RacunTypes } from "@ied-shared/constants/racun";

export const updateRacunTemplate = async (racunData: Racun, racunType: RacunTypes) => {
  const payload = {
    ...racunData,
    racunType,
  };
  try {
    const response = await axiosInstanceWithAuth.post(
      `${env.beURL}/api/docx/modify-template`,
      payload,
      {
        responseType: "blob",
      }
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
    const fileName = `${racunType}_${sanitizeFilename(racunData.naziv)}_${sanitizeFilename(racunData.nazivSeminara)}_${new Date().toISOString().split("T")[0].replace(/-/g, "")}.docx`;

    link.setAttribute("download", `${fileName}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating document:", error);
    throw error; // Re-throw to handle in the component
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
