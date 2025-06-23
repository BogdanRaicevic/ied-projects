import { Document, Schema, model } from "mongoose";

type RadnaMestaType = Document & {
	radno_mesto: string;
};

const radnaMestaSchema = new Schema<RadnaMestaType>(
	{
		radno_mesto: { type: String, required: true },
	},
	{ collection: "radna_mesta" },
);

export const RadnaMesta = model<RadnaMestaType>("RadnaMesta", radnaMestaSchema);
