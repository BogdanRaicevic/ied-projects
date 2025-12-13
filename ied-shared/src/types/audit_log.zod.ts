import z from "zod";

export const AuditLogZod = z.object({
  userEmail: z.string(),
  method: z.string(),
  route: z.string(),
  before: z.object({}).nullable().optional(),
  after: z.object({}).nullable().optional(),
  timestamp: z.coerce.date(),
  resource: z.object({
    model: z.string(),
    id: z.string().optional(),
  }),
});

export const AuditLogQueryParamsZod = z.object({
  userEmail: z.string().optional(),
  method: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  model: z.string().optional(),
  resourceId: z.string().optional(),
});

export const AuditLogStatsQueryParamsSchema = z.object({
  userEmail: z.string(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  model: z.string().optional().default("Firma"),
});

export type AuditLogType = z.infer<typeof AuditLogZod>;
export type AuditLogQueryParams = z.infer<typeof AuditLogQueryParamsZod>;
export type AuditLogStatsQueryParams = z.infer<
  typeof AuditLogStatsQueryParamsSchema
>;
