import type { TODO_ANY } from "./../../../ied-be/src/utils/utils";
import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";

export const savePretraga = async (
	queryParameters: TODO_ANY,
	pretraga: { id?: string; naziv: string },
) => {
	try {
		const body = {
			queryParameters,
			pretraga,
		};

		const response = await axiosInstanceWithAuth.post(
			`${env.beURL}/api/pretrage/save`,
			body,
		);
		return response.data;
	} catch (error) {
		console.error("Error saving pretraga:", error);
		throw error;
	}
};

export const fetchAllPretrage = async () => {
	try {
		const r = await axiosInstanceWithAuth.get(`${env.beURL}/api/pretrage`);
		return r.data;
	} catch (error) {
		console.log("Error fetching pregrage", error);
		throw error;
	}
};

export const deletePretraga = async ({ id }: { id: string }) => {
	try {
		const body = {
			id,
		};

		console.log("the body", body);

		const response = await axiosInstanceWithAuth.post(
			`${env.beURL}/api/pretrage/delete`,
			body,
		);
		return response.data;
	} catch (error) {
		console.error("Error deleting pretraga:", error);
		throw error;
	}
};
