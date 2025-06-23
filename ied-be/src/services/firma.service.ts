import { sanitizeFilter, type FilterQuery } from "mongoose";
import { type FirmaType, Firma } from "../models/firma.model";
import { createFirmaQuery } from "../utils/firmaQueryBuilder";
import { FirmaQueryParams } from "@ied-shared/types/firma.zod";
import { getZaposleniIdsFromSeminars } from "./seminar.service";
import { ExportFirma, ExportZaposlenih } from "@ied-shared/index";
export const findById = async (id: string): Promise<FirmaType | null> => {
	try {
		return await Firma.findById(id);
	} catch (error) {
		console.log("Error finding firma by od firma id:", error);
		throw new Error("Error finding firma by od firma id");
	}
};

export const deleteById = async (id: string): Promise<FirmaType | null> => {
	return await Firma.findByIdAndDelete(id).exec();
};

export const create = async (
	firmaData: Partial<FirmaType>,
): Promise<FirmaType> => {
	const firma = new Firma(firmaData);
	return await firma.save();
};

export const updateById = async (
	id: string,
	firmaData: Partial<FirmaType>,
): Promise<FirmaType | null> => {
	try {
		const sanitizedData = sanitizeFilter(firmaData as FilterQuery<FirmaType>);
		if (!id || typeof sanitizedData !== "object" || sanitizedData === null) {
			throw new Error("Invalid firma input data");
		}

		return await Firma.findOneAndUpdate(
			{ _id: id },
			{ $set: sanitizedData },
			{ new: true, runValidators: true },
		);
	} catch (error) {
		console.error("Error updating firma:", error);
		throw error;
	}
};

export const search = async (
	queryParameters: FirmaQueryParams,
	pageIndex = 1,
	pageSize = 50,
) => {
	const skip = (pageIndex - 1) * pageSize;
	const mongoQuery = await createFirmaQuery(queryParameters);

	const totalDocuments = await Firma.countDocuments(mongoQuery);

	return {
		courser: Firma.find(mongoQuery, { zaposleni: 0 })
			.sort({ naziv_firme: 1 })
			.skip(skip)
			.limit(pageSize)
			.cursor(),
		totalDocuments,
		totalPages: Math.ceil(totalDocuments / pageSize),
	};
};

export const exportSearchedFirmaData = async (
	queryParameters: FilterQuery<FirmaQueryParams>,
): Promise<ExportFirma> => {
	const mongoQuery = await createFirmaQuery(queryParameters);

	const cursor = Firma.find(mongoQuery, {
		naziv_firme: 1,
		e_mail: 1,
		delatnost: 1,
		tip_firme: 1,
		_id: 0,
	}).cursor();

	const res: ExportFirma = [];
	cursor.on("data", (doc) => {
		const plainObject = doc.toObject();
		res.push({
			naziv_firme: plainObject.naziv_firme,
			e_mail: plainObject.e_mail,
			delatnost: plainObject.delatnost,
			tip_firme: plainObject.tip_firme,
		});
	});

	return new Promise((resolve, reject) => {
		cursor.on("end", () => {
			resolve(res);
		});

		cursor.on("error", (err) => {
			console.error("Error reading data from the database:", err);
			reject(err);
		});
	});
};

export const exportSearchedZaposleniData = async (
	queryParameters: FilterQuery<FirmaQueryParams>,
): Promise<ExportZaposlenih> => {
	const mongoQuery = await createFirmaQuery(queryParameters);

	const seminarAttendees: string[] = await getZaposleniIdsFromSeminars(
		queryParameters.seminari || [],
	);

	if (queryParameters.negacije?.includes("negate-radno-mesto")) {
		mongoQuery.zaposleni = {
			$elemMatch: { radno_mesto: { $nin: queryParameters.radnaMesta } },
		};
	}

	const cursor = Firma.find(mongoQuery, {
		naziv_firme: 1,
		zaposleni: 1,
		_id: 0,
	}).cursor();

	const res: ExportZaposlenih = [];

	// Write the data to the writable stream
	cursor.on("data", (doc) => {
		const plainObject = doc.toObject();

		if (plainObject.zaposleni) {
			for (const z of plainObject.zaposleni) {
				const isZaposleniInSeminar = seminarAttendees?.includes(
					z._id.toString(),
				);
				const isRadnoMestoNegated =
					queryParameters.negacije?.includes("negate-radno-mesto");
				const isRadnoMestoIncluded = queryParameters.radnaMesta.includes(
					z.radno_mesto,
				);
				const hasNoRadnaMestaFilter = queryParameters.radnaMesta.length === 0;

				// Skip if zaposleni is not in the specified seminars
				if (queryParameters.seminari.length > 0 && !isZaposleniInSeminar) {
					continue;
				}

				let shouldAdd = false;
				if (isRadnoMestoNegated && !isRadnoMestoIncluded) {
					shouldAdd = true;
				}

				if (hasNoRadnaMestaFilter || isRadnoMestoIncluded) {
					shouldAdd = true;
				}

				if (shouldAdd) {
					res.push({
						naziv_firme: plainObject.naziv_firme,
						imePrezime: `${z.ime} ${z.prezime}`,
						e_mail: z.e_mail,
						radno_mesto: z.radno_mesto,
					});
				}
			}
		}
	});

	return new Promise((resolve, reject) => {
		cursor.on("end", () => {
			resolve(res);
		});

		cursor.on("error", (err) => {
			console.error("Error reading data from the database:", err);
			reject(err);
		});
	});
};
