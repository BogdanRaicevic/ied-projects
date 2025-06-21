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

export const auditLogQueryParams = z.object({
    userEmail: z.string().optional(),
    method: z.string().optional(),
    path: z.string().optional(),
    datumOd: z.coerce.date().optional(),
    datumDo: z.coerce.date().optional(),
});

export type AuditLogType = z.infer<typeof auditLogSchema>;
export type AuditLogQueryParams = z.infer<typeof auditLogQueryParams>;