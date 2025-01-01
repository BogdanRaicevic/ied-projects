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
	const { seminar_id, ...prijavaWithoutId } = prijava;

	const seminar = await Seminar.findById({ _id: { $eq: seminar_id } });
	if (!seminar) {
		throw new Error("Seminar not found");
	}

	if (
		seminar.prijave.some((p) => p.zaposleni_email === prijava.zaposleni_email)
	) {
		throw new Error("Zaposleni je već prijavljen na seminar");
	}

	seminar.prijave.push(prijavaWithoutId);
	return await seminar.save();
};
