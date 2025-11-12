import { model, Schema } from "mongoose";

export const SuppressionReason = {
  UNSUBSCRIBED: "UNSUBSCRIBED",
  HARD_BOUNCE: "HARD_BOUNCE",
  SPAM_COMPLAINT: "SPAM_COMPLAINT",
} as const;

export type EmailSuppression = {
  email: string;
  reason: keyof typeof SuppressionReason;
};

export const emailSuppressionSchema = new Schema<EmailSuppression>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    reason: {
      type: String,
      enum: Object.values(SuppressionReason),
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
