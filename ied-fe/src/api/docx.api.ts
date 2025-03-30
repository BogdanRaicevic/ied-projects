import axiosInstanceWithAuth from "./interceptors/auth";
import { env } from "../utils/envVariables";
import type { Racun } from "../components/Racun/types";
import { RacunTypes } from "@ied-shared/constants/racun";

export const updateRacunTemplate = async (racunData: Partial<Racun>, racunType: RacunTypes) => {
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
    const fileName = `racun_${racunData.naziv?.trim()}_${racunData.nazivSeminara?.trim()}_${new Date().toISOString().split("T")[0].replace(/-/g, "")}.docx`;

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
