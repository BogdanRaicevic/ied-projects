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

export const AuditLogStatsByDateResponseSchema = z.object({
  userEmail: z.string(),
  model: z.string(),
  dateStart: z.string(),
  dateEnd: z.string(),
  totalNew: z.number(),
  totalDeleted: z.number(),
  totalUpdated: z.number(),
  totalWorkedDays: z.string(),
  totalWorkedWeekendDays: z.number(),
  totalUnworkedDays: z.string(),
  averageUpdatesPerDay: z.number(),
  averageEstimatedWorkTime: z.number(),
  averageTimeBetweenEntries: z.number(),
  averageEditStartTime: z.string(),
  averageEditEndTime: z.string(),
  averageTimeForGreatestGap: z.number(),
  dailyStats: z.array(
    z.object({
      date: z.string(),
      new: z.number(),
      deleted: z.number(),
      aggregatedUpdated: z.number(),
      earliestEdit: z.string(),
      latestEdit: z.string(),
      estimatedWorkTime: z.number(),
      averageTimeBetweenEntries: z.number(),
      biggestGapBetweenEntries: z.number(),
    }),
  ),
});
export type AuditLogStatsByDateResponse = z.infer<
  typeof AuditLogStatsByDateResponseSchema
>;

export type AuditLogOverviewStats = Omit<
  AuditLogStatsByDateResponse,
  "dailyStats" | "userEmail" | "model" | "dateStart" | "dateEnd"
>;
