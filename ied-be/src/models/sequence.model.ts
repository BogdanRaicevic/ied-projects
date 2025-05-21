import { Document, model, Schema } from "mongoose";

const sequenceSchema = new Schema({
  _id: { type: String, required: true },
  sequenceNumber: { type: Number, default: 0 },
});

export const SequenceModel = model("Sequence", sequenceSchema);
export type SequenceModelType = Document & {
  _id: string;
  sequenceNumber: number;
};
