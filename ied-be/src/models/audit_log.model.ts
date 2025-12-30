import { type Document, model, Schema } from "mongoose";

export type AuditLogType = Document & {
  userEmail: string;
  method: string;
  route: string;
  before: object;
  after: object;
  timestamp: Date;
  resource?: {
    model: string;
    id?: string;
  };
};

const auditLogSchema = new Schema<AuditLogType>(
  {
    userEmail: { type: String, required: true },
    method: { type: String, required: true },
    route: { type: String, required: true },
    before: { type: Schema.Types.Mixed, default: null }, // State before the change
    after: { type: Schema.Types.Mixed, default: null }, // State after the change
    timestamp: { type: Date, default: Date.now },
    resource: {
      model: { type: String, required: true },
      id: { type: String, default: null }, // Optional ID for the resource
    },
  },
  {
    collection: "audit_logs",
  },
);

export const AuditLog = model<AuditLogType>("AuditLog", auditLogSchema);
