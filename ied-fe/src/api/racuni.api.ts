import {
  type IzdavacRacuna,
  type PretrageRacunaType,
  type RacunType,
  RacunZod,
  type TipRacuna,
} from "ied-shared";
import { validateOrThrow } from "../utils/zodErrorHelper";
import axiosInstanceWithAuth from "./interceptors/auth";

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
  queryParameters: PretrageRacunaType,
): Promise<{
  totalDocuments: number;
  totalPages: number;
  racuni: RacunType[];
}> => {
  const searchParams = {
    ...queryParameters,
    pageIndex,
    pageSize,
  };
  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/racuni/search`,
      searchParams,
    );
    const rawData = response.data;
    const parsedData = rawData.racuni.map((racun: any) =>
      RacunZod.parse(racun),
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

export const fetchRacunById = async (id: string): Promise<RacunType> => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/racuni/${id}`);
    return RacunZod.parse(response.data);
  } catch (error) {
    console.error("Error fetching racun by ID:", error);
    throw error;
  }
};

export const getRacunByPozivNaBrojAndIzdavac = async (
  pozivNaBroj: string,
  izdavacRacuna: IzdavacRacuna,
  tipRacuna?: TipRacuna,
): Promise<RacunType> => {
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

export const saveNewRacun = async (racun: RacunType): Promise<RacunType> => {
  try {
    validateOrThrow(RacunZod, racun);
    if (racun._id || racun.pozivNaBroj) {
      return racun; // or handle as needed
    }
    const response = await axiosInstanceWithAuth.post(
      `/api/racuni/save`,
      racun,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving new racun:", error);
    throw error;
  }
};

export const updateRacunById = async (
  updatedRacun: RacunType,
): Promise<RacunType> => {
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
