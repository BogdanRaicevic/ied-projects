import { Schema, Types } from "mongoose";

export type Zaposleni = {
	_id: Types.ObjectId;
	ID_kontakt_osoba: number;
	ime: string;
	prezime: string;
	radno_mesto: string;
	telefon: string;
	fax: string;
	e_mail: string;
	kontaktiran_puta: number;
	ucesce_na_seminarima: number;
	komentar: string;
	created_at: Date;
	updated_at: Date;
	created_by: string;
	updated_by: string;
};

export const zaposleniSchema = new Schema<Zaposleni>({
	_id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
	ID_kontakt_osoba: Number,
	ime: String,
	prezime: String,
	radno_mesto: { type: String, default: "nema" },
	telefon: String,
	e_mail: String,
	komentar: String,
});
