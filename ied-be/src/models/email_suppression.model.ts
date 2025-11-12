import { model, Schema } from "mongoose";

export enum SuppressionReason {
  UNSUBSCRIBED = "unsubscribed",
  HARD_BOUNCE = "hard_bounce",
  SPAM_COMPLAINT = "spam_complaint",
}

export type EmailSuppression = {
  email: string;
  reason: SuppressionReason;
};

export const emailSuppressionSchema = new Schema<EmailSuppression>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    reason: { type: String, enum: Object.values(SuppressionReason), required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  },
);

export const EmailSuppression = model<EmailSuppression>("EmailSuppression", emailSuppressionSchema);