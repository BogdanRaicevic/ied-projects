import axios from "axios";
import { Company } from "../schemas/companySchemas";
import { env } from "../utils/envVariables";

export const fetchFirmaPretrageData = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: any
) => {
  try {
    const body = {
      pageSize: pageSize || 10,
      pageIndex: pageIndex + 1, // becuase MRT is zero based
      queryParameters,
    };

    const response: {
      data: { firmas: any[]; totalPages: number; totalDocuments: number };
    } = await axios.post(`${env.beURL}/api/firma/search`, body);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const fetchSingleFirmaData = async (id: string): Promise<Company | null> => {
  try {
    const response = await axios.get(`${env.beURL}/api/firma/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const exportData = async (queryParameters: any, exportSubject: "firma" | "zaposleni") => {
  try {
    const body = {
      queryParameters,
    };

    const response = await axios.post(`${env.beURL}/api/firma/export-${exportSubject}-data`, body);
    return response.data;
  } catch (error) {
    console.error("Error exporting firma data:", error);
    throw error;
  }
};

export const saveFirma = async (company: Partial<Company>) => {
  try {
    if (company._id) {
      await axios.post(`${env.beURL}/api/firma/${company._id}`, company);
    } else {
      await axios.post(`${env.beURL}/api/firma`, company);
    }
  } catch (error) {
    console.error("Error saving firma: ", error);
    throw error;
  }
};
