import { TODO_ANY } from "./../../../ied-be/src/utils/utils";
import axios from "axios";
import { env } from "../utils/envVariables";

export const savePretraga = async (
  queryParameters: TODO_ANY,
  pretraga: { id?: string; naziv: string },
  token: string | null
) => {
  try {
    const body = {
      queryParameters,
      pretraga,
    };

    const response = await axios.post(`${env.beURL}/api/pretrage/save`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving pretraga:", error);
    throw error;
  }
};

export const fetchAllPretrage = async (token: string | null) => {
  try {
    const r = await axios.get(`${env.beURL}/api/pretrage`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return r.data;
  } catch (error) {
    console.log("Error fetching pregrage", error);
    throw error;
  }
};

export const deletePretraga = async ({ id, token }: { id: string; token: string | null }) => {
  try {
    const body = {
      id,
    };

    console.log("the body", body);

    const response = await axios.post(`${env.beURL}/api/pretrage/delete`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting pretraga:", error);
    throw error;
  }
};
