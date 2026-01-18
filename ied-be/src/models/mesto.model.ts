import { type Document, model, Schema } from "mongoose";

export type MestoType = Document & {
  naziv_mesto: string;
  ID_mesto: number;
  postanski_broj: string;
};

const mestoSchema = new Schema<MestoType>(
  {
    naziv_mesto: { type: String, required: true },
    postanski_broj: { type: String, required: true },
    ID_mesto: { type: Number, required: false },
  },
  { collection: "mesta" },
);

export const Mesto = model<MestoType>("Mesto", mestoSchema);
