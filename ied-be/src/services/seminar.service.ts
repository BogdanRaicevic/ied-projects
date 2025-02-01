import type { FilterQuery } from "mongoose";
import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { Seminar, type SeminarType } from "./../models/seminar.model";
import type {
	SaveSeminarParams,
	SeminarQueryParams,
} from "ied-shared/types/seminar";
import type { PrijavaNaSeminar } from "../routes/seminari.routes";
import { ErrorWithCause } from "../utils/customErrors";

export const saveSeminar = async (
	seminarData: SaveSeminarParams,
): Promise<SeminarType> => {
	if (seminarData._id) {
		const updatedSeminar = await Seminar.findByIdAndUpdate(
			seminarData._id,
			seminarData,
			{ new: true },
		);

		if (!updatedSeminar) {
			throw new Error("Seminar not found");
		}
		return updatedSeminar;
	}

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

// TODO: use PrijavaType instead of PrijavaNaSeminar
export const savePrijava = async (prijava: PrijavaNaSeminar) => {
	const { seminar_id, ...prijavaWithoutId } = prijava;

	const seminar = await Seminar.findById(seminar_id);
	if (!seminar) {
		throw new Error("Seminar not found");
	}

	if (
		seminar.prijave.some(
			(p) =>
				(p.zaposleni_email !== "" &&
					p.zaposleni_email === prijava.zaposleni_email) ||
				p.zaposleni_id === prijava.zaposleni_id ||
				(p.zaposleni_ime === prijava.zaposleni_ime &&
					p.zaposleni_prezime === prijava.zaposleni_prezime),
		)
	) {
		throw new ErrorWithCause(
			"Zaposleni je već prijavljen na seminar",
			"duplicate",
		);
	}

	seminar.prijave.push(prijavaWithoutId);
	return await seminar.save();
};

export const deletePrijava = async (
	zaposleni_id: string,
	seminar_id: string,
) => {
	const seminar = await Seminar.findById(seminar_id);
	if (!seminar) {
		throw new Error("Seminar not found");
	}

	seminar.prijave = seminar.prijave.filter(
		(p) => p.zaposleni_id.toString() !== zaposleni_id,
	);
	return await seminar.save();
};

export const deleteSeminar = async (id: string) => {
	const seminar = await Seminar.findOneAndDelete({ _id: id });

	if (!seminar) {
		throw new Error("Seminar not found");
	}

	return seminar;
};
