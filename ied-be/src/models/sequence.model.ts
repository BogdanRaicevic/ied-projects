import { type Document, model, Schema } from "mongoose";

type SequenceModelType = Document & {
  _id: string;
  sequenceNumber: number;
};

const sequenceSchema = new Schema({
  _id: { type: String, required: true },
  sequenceNumber: { type: Number, default: 0 },
});

export const SequenceModel = model<SequenceModelType>(
  "Sequence",
  sequenceSchema,
);
