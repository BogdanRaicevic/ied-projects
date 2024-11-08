import axios from "axios";
// import { env } from "../utils/envVariables";

export const saveSeminar = async (name: string, lecturer: string, location: string) => {
  try {
    const response = await axios.post("/api/seminari", { name, lecturer, location });
    return console.log(
      "Input:",
      "ime seminara:",
      response.data.name,
      "predavac",
      response.data.lecturer,
      "lokacija",
      response.data.location
    );
  } catch (error) {
    console.error("Error saving seminar: ", error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, status: 500, message: error.response.data.message };
    }
    return { success: false, status: 500, message: "An unexpected error occurred" };
  }
};
