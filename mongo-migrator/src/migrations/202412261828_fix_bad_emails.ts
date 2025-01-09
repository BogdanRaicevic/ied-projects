import { mongoDbConnection } from "../config";

export const up = async () => {
	const mongoDb = await mongoDbConnection();
	const mongoCollectionName = "firmas";

	try {
		const mongoCollection = mongoDb.collection(mongoCollectionName);

		const cursor = mongoCollection.find();

		while (await cursor.hasNext()) {
			const document = await cursor.next();

			const zaposleni: {
				[key: string]: number | string | Date;
				e_mail: string;
			}[] = document?.zaposleni || [];

			// Update emails in place
			for (const z of zaposleni) {
				z.e_mail = z.e_mail
					?.toLowerCase()
					.replace("č", "c")
					.replace("ć", "c")
					.replace("š", "s")
					.replace("ž", "z")
					.replace("đ", "d")
					.replace(",", ".")
					.replace(" ", "");
			}

			await mongoCollection.updateOne(
				{
					_id: document?._id,
				},
				{ $set: { zaposleni: zaposleni } },
			);
		}
	} catch (error) {
		console.error("Error during migration of fix bad emails:", error);
		throw error;
	}
};
