import { TODO_ANY } from "./../../../ied-be/src/utils/utils";
import axios from "axios";
import { env } from "../utils/envVariables";

export const savePretraga = async (queryParameters: TODO_ANY) => {
  try {
    const body = {
      queryParameters,
    };

    const response = await axios.post(`${env.beURL}/api/pretrage/save`, body);
    return response.data;
  } catch (error) {
    console.error("Error saving pretrage:", error);
    throw error;
  }
};

export const fetchAllPretrage = async () => {
  try {
    const r = await axios.get(`${env.beURL}/api/pretrage`);
    return r.data;
  } catch (error) {
    console.log("Error fetching pregrage", error);
    throw error;
  }
};
