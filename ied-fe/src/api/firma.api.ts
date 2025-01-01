import type { Company } from "../schemas/companySchemas";
import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";
import type { FirmaQueryParams } from "ied-shared/types/firmaQueryParams";

export const fetchFirmaPretrageData = async (
	pageSize: number,
	pageIndex: number,
	queryParameters: FirmaQueryParams,
) => {
	try {
		const body = {
			pageSize: pageSize || 50,
			pageIndex: pageIndex + 1, // becuase MRT is zero based
			queryParameters,
		};

		const response: {
			data: { firmas: any[]; totalPages: number; totalDocuments: number };
		} = await axiosInstanceWithAuth.post(`${env.beURL}/api/firma/search`, body);
		return response.data;
	} catch (error) {
		console.error("Error fetching firma data:", error);
		throw error;
	}
};

export const fetchSingleFirmaData = async (
	id: string,
): Promise<Company | null> => {
	try {
		const response = await axiosInstanceWithAuth.get(
			`${env.beURL}/api/firma/${id}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching firma data:", error);
		throw error;
	}
};

export const exportData = async (
	queryParameters: any,
	exportSubject: "firma" | "zaposleni",
) => {
	try {
		const body = {
			queryParameters,
		};

		const response = await axiosInstanceWithAuth.post(
			`${env.beURL}/api/firma/export-${exportSubject}-data`,
			body,
		);
		return response.data;
	} catch (error) {
		console.error("Error exporting firma data:", error);
		throw error;
	}
};

export const saveFirma = async (company: Partial<Company>) => {
	company.zaposleni?.map((z) => {
		if (z._id?.startsWith("temp")) {
			delete z._id;
		}
	});

	try {
		if (company._id) {
			const response = await axiosInstanceWithAuth.post(
				`${env.beURL}/api/firma/${company._id}`,
				company,
			);
			return {
				data: response.data,
				status: response.status,
			};
		}
		const response = await axiosInstanceWithAuth.post(
			`${env.beURL}/api/firma`,
			company,
		);
		return {
			data: response.data,
			status: response.status,
		};
	} catch (error) {
		console.error("Error saving firma: ", error);
		// if (axiosInstanceWithAuth.isAxiosError(error) && error.response) {
		//   return { success: false, status: 500, message: error.response.data.message };
		// }
		return {
			success: false,
			status: 500,
			message: "An unexpected error occurred",
		};
	}
};

export const deleteFirma = async (id: string) => {
	try {
		const response = await axiosInstanceWithAuth.delete(
			`${env.beURL}/api/firma/${id}`,
		);
		return {
			data: response.data,
			status: response.status,
		};
	} catch (error) {
		console.error("Error deleting firma: ", error);
		throw error;
	}
};
