import { model, Schema, type Types } from "mongoose";

export type DelatnostType = {
  _id: Types.ObjectId;
  delatnost: string;
};

const delatnostSchema = new Schema<DelatnostType>(
  {
    delatnost: { type: String, required: true },
  },
  { collection: "delatnosti" },
);

export const Delatnost = model<DelatnostType>("Delatnost", delatnostSchema);
