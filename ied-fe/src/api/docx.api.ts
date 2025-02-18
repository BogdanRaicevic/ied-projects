import axiosInstanceWithAuth from "./interceptors/auth";
import { env } from "../utils/envVariables";
import type { Racun } from "../components/Racun/RacunForm";

export const updateRacunTemplate = async (racunData: Partial<Racun>) => {
  try {
    const response = await axiosInstanceWithAuth.post(
      `${env.beURL}/api/docx/modify-template`,
      racunData,
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "racun.docx");
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("Error downloading the document:", error);
  }
};
