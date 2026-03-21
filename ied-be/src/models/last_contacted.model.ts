import { model, Schema } from "mongoose";

type LastContactedType = {
  date: Date;
  userEmail: string;
  type: "email" | "telefon";
};

const lastContactedSchema = new Schema<LastContactedType>({
  date: { type: Date, default: Date.now },
  userEmail: String,
  type: { type: String, enum: ["email", "telefon"] },
});

const LastContacted = model<LastContactedType>(
  "LastContacted",
  lastContactedSchema,
);

export { LastContacted, type LastContactedType, lastContactedSchema };
