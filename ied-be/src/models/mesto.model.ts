import { model, Schema, type Types } from "mongoose";

export type MestoType = {
  _id: Types.ObjectId;
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
