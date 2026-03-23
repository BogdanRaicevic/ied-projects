import { type ContactTypeEnum, ContactTypes } from "ied-shared";
import { model, Schema } from "mongoose";

type LastContactedType = {
  date: Date;
  e_mail: string;
  contact_type: ContactTypeEnum;
};

const lastContactedSchema = new Schema<LastContactedType>({
  date: { type: Date, default: Date.now },
  e_mail: String,
  contact_type: {
    type: String,
    enum: ContactTypes,
  },
});

const LastContacted = model<LastContactedType>(
  "LastContacted",
  lastContactedSchema,
);

export { LastContacted, type LastContactedType, lastContactedSchema };
