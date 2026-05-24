import type { RacunV2Form } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export type GenerateRacunV2Response = {
  ok: boolean;
  message: string;
  tipRacuna: RacunV2Form["tipRacuna"];
  pozivNaBroj: string;
};

export const submitRacunV2ForGeneration = async (
  racunData: RacunV2Form,
): Promise<GenerateRacunV2Response> => {
  try {
    const response = await axiosInstanceWithAuth.post<GenerateRacunV2Response>(
      "/api/racuni-v2/generate",
      racunData,
    );

    return response.data;
  } catch (error) {
    console.error("Racun V2 generation request error:", error);
    throw error;
  }
};
