import axios from "axios";
import { env } from "../utils/envVariables";

export const saveSeminar = async (
  naziv: string,
  predavac: string,
  lokacija: string,
  cena: string,
  datum: string,
  token: string | null
) => {
  try {
    if (!naziv) {
      console.log("Seminar must contain a name");
      return;
    }
    const response = await axios.post(
      `${env.beURL}/api/seminari/save`,
      {
        naziv,
        predavac,
        lokacija,
        cena,
        datum,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error saving seminar: ", error);
    return { success: false, status: 500, message: "An unexpected error occurred" };
  }
};

export const searchSeminar = async (
  naziv: string,
  predavac: string,
  lokacija: string,
  datumOd: string | null,
  datumDo: string | null,
  token: string | null
) => {
  try {
    const response = await axios.post(
      `${env.beURL}/api/seminari/search`,
      {
        naziv,
        predavac,
        lokacija,
        datumOd,
        datumDo,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error finding seminar: ", error);
    return { success: false, status: 500, message: "An unexpected error occurred" };
  }
};
