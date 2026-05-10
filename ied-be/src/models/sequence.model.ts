import { model, Schema } from "mongoose";

type SequenceModelType = {
  _id: string;
  sequenceNumber: number;
};

const sequenceSchema = new Schema<SequenceModelType>({
  _id: { type: String, required: true },
  sequenceNumber: { type: Number, default: 0 },
});

export const SequenceModel = model<SequenceModelType>(
  "Sequence",
  sequenceSchema,
);
