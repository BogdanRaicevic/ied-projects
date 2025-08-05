import z from "zod";

export const AuditLogZod = z.array(
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
        }).optional(),
    }),
);

export type AuditLogType = z.infer<typeof AuditLogZod>;