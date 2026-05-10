import { SUPPRESSION_REASONS, type SuppressionReasons } from "ied-shared";
import { model, Schema, type Types } from "mongoose";

export type EmailSuppression = {
  _id: Types.ObjectId;
  email: string;
  reason: SuppressionReasons;
};

const emailSuppressionSchema = new Schema<EmailSuppression>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    reason: {
      type: String,
      enum: Object.values(SUPPRESSION_REASONS),
      required: true,
    },
  },
  {
    collection: "email_suppressions",
  },
);

emailSuppressionSchema.index({ email: 1 }, { unique: true });

export const EmailSuppression = model<EmailSuppression>(
  "EmailSuppression",
  emailSuppressionSchema,
);
