import { Document, model, Schema } from "mongoose";

export type AuditLogType = Document & {
  userId: string;
  userEmail: string;
  method: string;
  path: string;
  requestParams?: object;
  requestQuery?: object;
  requestBody?: object;
  statusCode: number;
  timestamp: Date;
};

const audtiLogSchema = new Schema<AuditLogType>({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  method: { type: String, required: true },
  path: { type: String, required: true },
  requestParams: { type: Object, required: false },
  requestQuery: { type: Object, required: false },
  requestBody: { type: Object, required: false },
  statusCode: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

export const AuditLog = model<AuditLogType>("AuditLog", audtiLogSchema, "audit_logs");
