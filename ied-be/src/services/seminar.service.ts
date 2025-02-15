import type { FilterQuery } from "mongoose";
import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { Seminar, type SeminarType } from "./../models/seminar.model";
import type {
	PrijavaNaSeminar,
	SaveSeminarParams,
	SeminarQueryParams,
} from "@ied-shared/types/index";
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

export const getSeminarById = async (id: string) => {
	const seminar = await Seminar.findById(id);
	if (!seminar) {
		throw new Error("Seminar not found");
	}

	return seminar;
};

export const getAllSeminars = async () => {
	return await Seminar.find({}, { naziv: 1, datum: 1, _id: 1 }).exec();
};

export const savePrijava = async (prijava: PrijavaNaSeminar) => {
	const { seminar_id, _id, ...prijavaWithoutId } = prijava;

	const seminar = await Seminar.findById(seminar_id);
	if (!seminar) {
		throw new Error("Seminar not found");
	}

	if (seminar.prijave.some((p) => p.zaposleni_id === prijava.zaposleni_id)) {
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
