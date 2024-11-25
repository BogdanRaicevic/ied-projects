import axios from "axios";
import { Company } from "../schemas/companySchemas";
import { env } from "../utils/envVariables";

export const fetchFirmaPretrageData = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: any,
  token: string | null
) => {
  try {
    const body = {
      pageSize: pageSize || 10,
      pageIndex: pageIndex + 1, // becuase MRT is zero based
      queryParameters,
    };

    const response: {
      data: { firmas: any[]; totalPages: number; totalDocuments: number };
    } = await axios.post(`${env.beURL}/api/firma/search`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const fetchSingleFirmaData = async (
  id: string,
  token: string | null
): Promise<Company | null> => {
  try {
    const response = await axios.get(`${env.beURL}/api/firma/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const exportData = async (
  queryParameters: any,
  exportSubject: "firma" | "zaposleni",
  token: string | null
) => {
  try {
    const body = {
      queryParameters,
    };

    const response = await axios.post(`${env.beURL}/api/firma/export-${exportSubject}-data`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting firma data:", error);
    throw error;
  }
};

export const saveFirma = async (company: Partial<Company>, token: string | null) => {
  try {
    if (company._id) {
      const response = await axios.post(`${env.beURL}/api/firma/${company._id}`, company, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        data: response.data,
        status: response.status,
      };
    } else {
      const response = await axios.post(`${env.beURL}/api/firma`, company, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        data: response.data,
        status: response.status,
      };
    }
  } catch (error) {
    console.error("Error saving firma: ", error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, status: 500, message: error.response.data.message };
    }
    return { success: false, status: 500, message: "An unexpected error occurred" };
  }
};
