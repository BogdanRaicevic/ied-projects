import { Schema, model } from "mongoose";

export type VelicineFirmiType = Document & {
	ID_velicina_firme: number;
	velicina_firme: string;
};

const velicineFirmeSchema = new Schema<VelicineFirmiType>(
	{
		ID_velicina_firme: { type: Number, required: true },
		velicina_firme: { type: String, required: true },
	},
	{ collection: "velicine_firmi" },
);

export const VelicineFirmi = model<VelicineFirmiType>(
	"VelicineFirmi",
	velicineFirmeSchema,
);
