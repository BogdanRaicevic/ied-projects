import { z } from "zod";

export const auditLogSchema = z.object({
    userEmail: z.string(),
    method: z.string(),
    path: z.string(),
    requestParams: z.object({}).optional(),
    requestQuery: z.object({}).optional(),
    requestBody: z.object({}).optional(),
    beforeChanges: z.object({}).optional(),
    timestamp: z.date(),
});

export type AuditLogType = z.infer<typeof auditLogSchema>;