import axiosInstanceWithAuth from "./interceptors/auth";
import { env } from "../utils/envVariables";

export const getIzdavaciRacuna = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/racuni/izdavaci`);
    return response.data;
  } catch (error) {
    console.error("Error fetching izdavaci racuna:", error);
    throw error;
  }
};
