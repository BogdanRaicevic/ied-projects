import { model, Schema } from "mongoose";

type LastContactedType = {
  date: Date;
  e_mail: string;
  contact_type: "email" | "telefon";
};

const lastContactedSchema = new Schema<LastContactedType>({
  date: { type: Date, default: Date.now },
  e_mail: String,
  contact_type: { type: String, enum: ["email", "telefon"] },
});

const LastContacted = model<LastContactedType>(
  "LastContacted",
  lastContactedSchema,
);

export { LastContacted, type LastContactedType, lastContactedSchema };
