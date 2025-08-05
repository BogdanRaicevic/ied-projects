import z from "zod";

export const AuditLogZod =
    z.object({
        userEmail: z.string(),
        method: z.string(),
        route: z.string(),
        before: z.object({}).optional(),
        after: z.object({}).optional(),
        timestamp: z.date(),
        resource: z.object({
            model: z.string(),
            id: z.string().optional(),
        }),
    });

export const AuditLogQueryParamsZod = z.object({
    userEmail: z.string().optional(),
    method: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    model: z.string().optional(),
    resourceId: z.string().optional(),
});

export type AuditLogType = z.infer<typeof AuditLogZod>;
export type AuditLogQueryParams = z.infer<typeof AuditLogQueryParamsZod>;