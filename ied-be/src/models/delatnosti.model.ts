import { Schema, model } from "mongoose";

export type DelatnostType = Document & {
  delatnost: string;
};

const delatnostSchema = new Schema<DelatnostType>(
  {
    delatnost: { type: String, required: true },
  },
  { collection: "delatnosti" }
);

export const Delatnost = model<DelatnostType>("Delatnost", delatnostSchema);
