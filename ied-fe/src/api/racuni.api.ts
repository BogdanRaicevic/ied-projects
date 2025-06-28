import axiosInstanceWithAuth from "./interceptors/auth";
import {
  IzdavacRacuna,
  PretrageRacunaZodType,
  RacunSchema,
  RacunZod,
  TipRacuna,
} from "@ied-shared/index";
import { validateOrThrow } from "../utils/zodErrorHelper";

export const getIzdavaciRacuna = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/racuni/izdavaci`);
    return response.data;
  } catch (error) {
    console.error("Error fetching izdavaci racuna:", error);
    throw error;
  }
};

export const searchRacuni = async (
  pageIndex: number,
  pageSize: number,
  queryParameters: PretrageRacunaZodType,
): Promise<{
  totalDocuments: number;
  totalPages: number;
  racuni: RacunZod[];
}> => {
  const searchParams = {
    ...queryParameters,
    pageIndex: pageIndex,
    pageSize: pageSize,
  };
  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/racuni/search`,
      searchParams,
    );
    const rawData = response.data;
    const parsedData = rawData.racuni.map((racun: any) =>
      RacunSchema.parse(racun),
    );

    return {
      totalDocuments: rawData.totalDocuments,
      totalPages: rawData.totalPages,
      racuni: parsedData,
    };
  } catch (error) {
    console.error("Error searching racuni:", error);
    throw error;
  }
};

export const fetchRacunById = async (id: string): Promise<RacunZod> => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/racuni/${id}`);
    return RacunSchema.parse(response.data);
  } catch (error) {
    console.error("Error fetching racun by ID:", error);
    throw error;
  }
};

export const getRacunByPozivNaBrojAndIzdavac = async (
  pozivNaBroj: string,
  izdavacRacuna: IzdavacRacuna,
  tipRacuna?: TipRacuna,
): Promise<RacunZod> => {
  try {
    const params = new URLSearchParams({
      pozivNaBroj: pozivNaBroj,
      izdavacRacuna: izdavacRacuna,
      ...(tipRacuna && { tipRacuna: tipRacuna }),
    });

    const response = await axiosInstanceWithAuth.get(
      `/api/racuni?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching racun by poziv na broj and izdavac:", error);
    throw error;
  }
};

export const saveNewRacun = async (racun: RacunZod): Promise<RacunZod> => {
  try {
    validateOrThrow(RacunSchema, racun);
    if (racun._id || racun.pozivNaBroj) {
      console.log(
        "Racun already has an ID or pozivNaBroj, skipping save operation.",
      );
      return racun; // or handle as needed
    }
    const response = await axiosInstanceWithAuth.post(
      `/api/racuni/save`,
      racun,
    );
    console.log("Racun saved:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error saving new racun:", error);
    throw error;
  }
};

export const updateRacunById = async (
  updatedRacun: RacunZod,
): Promise<RacunZod> => {
  try {
    const response = await axiosInstanceWithAuth.put(
      `/api/racuni/update/${updatedRacun._id}`,
      updatedRacun,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating racun by ID:", error);
    throw error;
  }
};
