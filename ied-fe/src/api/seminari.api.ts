import type { Seminar } from "../schemas/companySchemas";
import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";
import type { SeminarQueryParams } from "ied-shared/types/seminar";

export type PrijavaNaSeminar = {
	seminar_id: string;
	firma_id: string;
	firma_naziv: string;
	firma_email: string;
	firma_telefon: string;
	zaposleni_id: string;
	zaposleni_ime: string;
	zaposleni_prezime: string;
	zaposleni_email: string;
	zaposleni_telefon: string;
	prisustvo: "online" | "offline" | "ne znam";
};

export const saveSeminar = async (
	naziv: string,
	predavac: string,
	lokacija: string,
	onlineCena: string,
	offlineCena: string,
	datum: string,
) => {
	try {
		if (!naziv) {
			console.log("Seminar must contain a name");
			return;
		}
		const response = await axiosInstanceWithAuth.post(
			`${env.beURL}/api/seminari/save`,
			{
				naziv,
				predavac,
				lokacija,
				onlineCena,
				offlineCena,
				datum,
			},
		);

		return response.data;
	} catch (error) {
		console.error("Error saving seminar: ", error);
		throw error;
	}
};

export const fetchSeminari = async (
	pageSize: number,
	pageIndex: number,
	queryParameters: SeminarQueryParams,
) => {
	try {
		const body = {
			pageSize: pageSize || 50,
			pageIndex: pageIndex + 1, // becuase MRT is zero based
			queryParameters,
		};

		const response: {
			data: { seminari: Seminar[]; totalPages: number; totalDocuments: number };
		} = await axiosInstanceWithAuth.post(
			`${env.beURL}/api/seminari/search`,
			body,
		);

		return response.data;
	} catch (error) {
		console.error("Error fetching firma data:", error);
		throw error;
	}
};

export const savePrijava = async (prijava: PrijavaNaSeminar) => {
	try {
		const response = await axiosInstanceWithAuth.post(
			`${env.beURL}/api/seminari/save-prijava`,
			prijava,
		);

		return response.data;
	} catch (error) {
		console.error("Error saving prijava: ", error);
		throw error;
	}
};
