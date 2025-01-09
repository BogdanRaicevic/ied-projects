import { Types } from "mongoose";
import { mongoDbConnection } from "../config";

export const up = async () => {
	const mongoDb = await mongoDbConnection();
	const mongoCollectionName = "firmas";

	try {
		const mongoCollection = mongoDb.collection(mongoCollectionName);

		const cursor = mongoCollection.find();

		while (await cursor.hasNext()) {
			const document: any = await cursor.next();

			if (document.zaposleni && Array.isArray(document.zaposleni)) {
				let updated = false;

				const updatedZaposleni = document.zaposleni.map((z: any) => {
					if (!z._id) {
						z._id = new Types.ObjectId();
						updated = true;
					}
					return z;
				});

				if (updated) {
					await mongoCollection.updateOne(
						{
							_id: document._id,
						},
						{ $set: { zaposleni: updatedZaposleni } },
					);
				}
			}
		}
	} catch (error) {
		console.error("Error during migration add id to zaposleni:", error);
		throw error;
	}
};
