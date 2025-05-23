import { Document, Schema, model } from "mongoose";

type DelatnostType = Document & {
  delatnost: string;
};

const delatnostSchema = new Schema<DelatnostType>(
  {
    delatnost: { type: String, required: true },
  },
  { collection: "delatnosti" }
);

export const Delatnost = model<DelatnostType>("Delatnost", delatnostSchema);
