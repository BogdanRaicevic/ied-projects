import axiosInstanceWithAuth from "./interceptors/auth";
import { env } from "../utils/envVariables";
import { Racun } from "@ied-shared/index";

export const getIzdavaciRacuna = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/racuni/izdavaci`);
    return response.data;
  } catch (error) {
    console.error("Error fetching izdavaci racuna:", error);
    throw error;
  }
};

export const searchRacuni = async (searchParams: any) => {
  try {
    const response = await axiosInstanceWithAuth.post(
      `${env.beURL}/api/racuni/search`,
      searchParams
    );
    return response.data;
  } catch (error) {
    console.error("Error searching racuni:", error);
    throw error;
  }
};

export const fetchRacunById = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/racuni/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching racun by ID:", error);
    throw error;
  }
};

export const saveNewRacun = async (racun: Racun) => {
  try {
    if (racun._id || racun.pozivNaBroj) {
      console.log("Racun already has an ID or pozivNaBroj, skipping save operation.");
      return racun; // or handle as needed
    }
    const response = await axiosInstanceWithAuth.post(`${env.beURL}/api/racuni/save`, racun);
    return response.data;
  } catch (error) {
    console.error("Error saving new racun:", error);
    throw error;
  }
};

export const updateRacunById = async (updatedRacun: Racun) => {
  try {
    const response = await axiosInstanceWithAuth.put(
      `${env.beURL}/api/racuni/update/${updatedRacun._id}`,
      updatedRacun
    );
    return response.data;
  } catch (error) {
    console.error("Error updating racun by ID:", error);
    throw error;
  }
};
