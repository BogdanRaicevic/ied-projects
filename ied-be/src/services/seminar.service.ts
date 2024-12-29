import { Types, type FilterQuery } from "mongoose";
import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { Seminar, type SeminarType } from "./../models/seminar.model";
import type {
	SaveSeminarParams,
	SeminarQueryParams,
} from "ied-shared/types/seminar";
import type { PrijavaNaSeminar } from "../routes/seminari.routes";

export const saveSeminar = async (
	seminarData: SaveSeminarParams,
): Promise<SeminarType> => {
	const seminar = new Seminar(seminarData);
	return await seminar.save();
};

export const search = async (
	queryParameters: FilterQuery<SeminarQueryParams>,
	pageIndex = 1,
	pageSize = 50,
) => {
	const skip = (pageIndex - 1) * pageSize;
	const mongoQuery = createSeminarQuery(queryParameters.queryParameters);

	const totalDocuments = await Seminar.countDocuments(mongoQuery);

	return {
		courser: Seminar.find(mongoQuery, { zaposleni: 0 })
			.sort({ naziv_firme: 1 })
			.skip(skip)
			.limit(pageSize)
			.cursor(),
		totalDocuments,
		totalPages: Math.ceil(totalDocuments / pageSize),
	};
};

export const savePrijava = async (prijava: PrijavaNaSeminar) => {
	const seminar = await Seminar.findById(prijava.seminar_id);
	if (!seminar) {
		throw new Error("Seminar not found");
	}
	seminar.prijave.push({
		id_firme: prijava.firma_id,
		id_zaposlenog: prijava.zaposleni_id,
		naziv_firme: prijava.firma_naziv,
		email_firme: prijava.firma_email,
		telefon_firme: prijava.firma_telefon,
		ime_zaposlenog: prijava.zaposleni_ime,
		prezime_zaposlenog: prijava.zaposleni_prezime,
		email_zaposlenog: prijava.zaposleni_email,
		telefon_zaposlenog: prijava.zaposleni_telefon,
		prisustvo: prijava.prisustvo,
	});
	return await seminar.save();
};
