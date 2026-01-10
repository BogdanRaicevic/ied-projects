import { SUPPRESSION_REASONS, type SuppressionReasons } from "ied-shared";
import { model, Schema } from "mongoose";

export type EmailSuppression = {
  email: string;
  reason: SuppressionReasons;
};

const emailSuppressionSchema = new Schema<EmailSuppression>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
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

export const EmailSuppression = model<EmailSuppression>(
  "EmailSuppression",
  emailSuppressionSchema,
);
