import { mongoDbConnection } from "../config";

export const up = async () => {
	const mongoDb = await mongoDbConnection();
	const mongoCollectionName = "firmas";

	try {
		const mongoCollection = mongoDb.collection(mongoCollectionName);

		const cursor = mongoCollection.find();

		while (await cursor.hasNext()) {
			const document = await cursor.next();

			const updatedDocument = removeNemaValue(document);

			await mongoCollection.updateOne(
				{
					_id: document!._id,
				},
				{ $set: updatedDocument },
			);
		}
	} catch (error) {
		console.error(
			"Error during migration of remove word __nema__ from firmas:",
			error,
		);
		throw error;
	}
};

const removeNemaValue = (obj: any): any => {
	if (!obj) return obj;

	if (typeof obj === "string") {
		return obj.toLowerCase() === "nema" ? "" : obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => removeNemaValue(item));
	}

	if (typeof obj === "object") {
		const newObj: any = {};
		for (const key in obj) {
			if (key === "_id") {
				continue;
			}
			newObj[key] = removeNemaValue(obj[key]);
		}
		return newObj;
	}

	return obj;
};
