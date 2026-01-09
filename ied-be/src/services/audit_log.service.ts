import assert from "node:assert";
import type {
  AuditLogOverviewStats,
  AuditLogQueryParams,
  DailyStat,
} from "@ied-shared/types/audit_log.zod";
import { differenceInBusinessDays } from "date-fns";
import { AuditLog } from "./../models/audit_log.model";
import { createAuditLogQuery } from "../utils/auditLogQueryBuilder";

type AuditQuery = {
  pageIndex: number;
  pageSize: number;
  filterParams: AuditLogQueryParams;
};

type AggregateResult = {
  totalCounts: Array<{
    _id: { date: string; operationType: string };
    count: number;
  }>;
  uniqueCounts: Array<{
    _id: { date: string; operationType: string };
    count: number;
  }>;
  timestamps: Array<{
    _id: string;
    timestamps: Date[];
  }>;
};

export const getAuditLogs = async ({
  pageIndex = 0,
  pageSize = 50,
  filterParams,
}: AuditQuery) => {
  try {
    const auditQuery = createAuditLogQuery(filterParams);

    const totalDocuments = await AuditLog.countDocuments(auditQuery);
    const data = await AuditLog.find(auditQuery)
      .sort({ timestamp: -1 })
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .lean();

    return {
      data,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / pageSize),
    };
  } catch (error) {
    console.error("Error finding audit log", error);
    throw error;
  }
};

export const getUserChangesStats = async (params: AuditLogQueryParams) => {
  try {
    const { userEmail, dateFrom, dateTo, model } = params;

    // Build match conditions
    const matchConditions: Record<string, unknown> = {
      userEmail,
      "resource.model": model,
    };

    if (dateFrom || dateTo) {
      matchConditions.timestamp = {};
      if (dateFrom) {
        (matchConditions.timestamp as Record<string, unknown>).$gte = dateFrom;
      }
      if (dateTo) {
        (matchConditions.timestamp as Record<string, unknown>).$lte = dateTo;
      }
    }

    const result = await AuditLog.aggregate([
      // Match the user and model
      { $match: matchConditions },

      // Add a field to categorize the operation type
      {
        $addFields: {
          operationType: {
            $switch: {
              branches: [
                // biome-ignore lint: MongoDB aggregation $switch requires "then" keyword
                { case: { $eq: ["$before", null] }, then: "new" },
                // biome-ignore lint: MongoDB aggregation $switch requires "then" keyword
                { case: { $eq: ["$after", null] }, then: "deleted" },
              ],
              default: "changed",
            },
          },
        },
      },

      // Sort by timestamp to get the first operation chronologically
      {
        $sort: { timestamp: 1 },
      },

      // Group by resource.id and get the first operation type
      {
        $group: {
          _id: "$resource.id",
          operationType: { $first: "$operationType" },
        },
      },

      // Group by operation type to count unique IDs
      {
        $group: {
          _id: "$operationType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform the result into the desired format
    const stats: {
      userEmail?: string;
      new: number;
      deleted: number;
      changed: number;
      totalUnique: number;
      model?: string;
      dateStart?: Date;
      dateEnd?: Date;
    } = {
      userEmail,
      new: 0,
      deleted: 0,
      changed: 0,
      totalUnique: 0,
      model,
      ...(dateFrom && { dateStart: dateFrom }),
      ...(dateTo && { dateEnd: dateTo }),
    };

    for (const item of result) {
      if (item._id === "new") stats.new = item.count;
      else if (item._id === "deleted") stats.deleted = item.count;
      else if (item._id === "changed") stats.changed = item.count;
    }

    stats.totalUnique = stats.new + stats.deleted + stats.changed;

    return stats;
  } catch (error) {
    console.error("Error getting user changes stats", error);
    throw new Error("Error getting user changes stats");
  }
};

export const getUserChanges2 = async (params: AuditLogQueryParams) => {
  try {
    const { userEmail, dateFrom, dateTo, model } = params;

    // Build match conditions
    const matchConditions: Record<string, unknown> = {
      userEmail,
      "resource.model": model,
    };

    if (dateFrom || dateTo) {
      matchConditions.timestamp = {};
      if (dateFrom) {
        (matchConditions.timestamp as Record<string, unknown>).$gte = dateFrom;
      }
      if (dateTo) {
        (matchConditions.timestamp as Record<string, unknown>).$lte = dateTo;
      }
    }

    const result = await AuditLog.aggregate([
      // Match the user and model
      { $match: matchConditions },

      // Categorize each operation
      {
        $addFields: {
          operationType: {
            $switch: {
              branches: [
                // biome-ignore lint: MongoDB aggregation $switch requires "then" keyword
                { case: { $eq: ["$before", null] }, then: "new" },
                // biome-ignore lint: MongoDB aggregation $switch requires "then" keyword
                { case: { $eq: ["$after", null] }, then: "deleted" },
              ],
              default: "updated",
            },
          },
        },
      },

      // Facet to get both total counts and unique counts
      {
        $facet: {
          // Total counts (including duplicates)
          totalCounts: [
            {
              $group: {
                _id: "$operationType",
                count: { $sum: 1 },
              },
            },
          ],
          // Unique counts (aggregated by resource.id)
          uniqueCounts: [
            {
              $group: {
                _id: {
                  operationType: "$operationType",
                  resourceId: "$resource.id",
                },
              },
            },
            {
              $group: {
                _id: "$_id.operationType",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // Transform the result
    const stats = {
      userEmail,
      new: 0,
      deleted: 0,
      updated: 0,
      aggregatedChanges: 0,
      model,
      ...(dateFrom && { dateStart: dateFrom }),
      ...(dateTo && { dateEnd: dateTo }),
    };

    // Process total counts
    if (result[0]?.totalCounts) {
      for (const item of result[0].totalCounts) {
        if (item._id === "new") stats.new = item.count;
        else if (item._id === "deleted") stats.deleted = item.count;
        else if (item._id === "updated") stats.updated = item.count;
      }
    }

    // Process unique counts for aggregatedChanges
    if (result[0]?.uniqueCounts) {
      for (const item of result[0].uniqueCounts) {
        stats.aggregatedChanges += item.count;
      }
    }

    return stats;
  } catch (error) {
    console.error("Error getting user changes stats v2", error);
    throw new Error("Error getting user changes stats v2");
  }
};

export const getUserChangesByDate = async (params: AuditLogQueryParams) => {
  try {
    const { userEmail, dateFrom, dateTo, model } = params;

    // Build match conditions
    const matchConditions: Record<string, unknown> = {
      userEmail,
      "resource.model": model,
    };

    if (dateFrom || dateTo) {
      matchConditions.timestamp = {};
      if (dateFrom) {
        (matchConditions.timestamp as Record<string, unknown>).$gte = dateFrom;
      }
      if (dateTo) {
        (matchConditions.timestamp as Record<string, unknown>).$lte = dateTo;
      }
    }

    // TODO: Fix type issues below
    const result = await AuditLog.aggregate<AggregateResult>([
      // Match the user and model
      { $match: matchConditions },

      // Categorize each operation
      {
        $addFields: {
          operationType: {
            $switch: {
              branches: [
                // biome-ignore lint: MongoDB aggregation $switch requires "then" keyword
                { case: { $eq: ["$before", null] }, then: "new" },
                // biome-ignore lint: MongoDB aggregation $switch requires "then" keyword
                { case: { $eq: ["$after", null] }, then: "deleted" },
              ],
              default: "updated",
            },
          },
          // Extract date only (YYYY-MM-DD)
          dateOnly: {
            $dateToString: {
              format: "%Y-%m-%dT00:00:00.000Z",
              date: "$timestamp",
              timezone: "UTC",
            },
          },
        },
      },

      // Group by date and operation type
      {
        $facet: {
          // Total counts per date
          totalCounts: [
            {
              $group: {
                _id: {
                  date: "$dateOnly",
                  operationType: "$operationType",
                },
                count: { $sum: 1 },
              },
            },
          ],
          // Unique counts per date (aggregated by resource.id)
          uniqueCounts: [
            {
              $group: {
                _id: {
                  date: "$dateOnly",
                  operationType: "$operationType",
                  resourceId: "$resource.id",
                },
              },
            },
            {
              $group: {
                _id: {
                  date: "$_id.date",
                  operationType: "$_id.operationType",
                },
                count: { $sum: 1 },
              },
            },
          ],
          // Timestamps per date for time analysis
          timestamps: [
            {
              $group: {
                _id: "$dateOnly",
                timestamps: { $push: "$timestamp" },
              },
            },
          ],
        },
      },
    ]);

    // Transform the result into a map grouped by date
    const dateMap = new Map<string, DailyStat>();

    const defaultDateStats = {
      date: "",
      new: 0,
      deleted: 0,
      aggregatedUpdated: 0,
      earliestEdit: "N/A",
      latestEdit: "N/A",
      estimatedWorkTime: 0,
      averageTimeBetweenEntries: 0,
      biggestGapBetweenEntries: 0,
    };

    // Helper function to get or create date stats
    const getOrCreateDateStats = (date: string): DailyStat => {
      if (!dateMap.has(date)) {
        dateMap.set(date, { ...defaultDateStats, date });
      }
      return dateMap.get(date)!;
    };

    // Process total counts
    if (result[0]?.totalCounts) {
      for (const item of result[0].totalCounts) {
        const date = item._id.date;
        const dateStats = getOrCreateDateStats(date);

        if (item._id.operationType === "new") {
          dateStats.new = item.count;
        } else if (item._id.operationType === "deleted") {
          dateStats.deleted = item.count;
        }
      }
    }

    // Process unique counts for aggregatedUpdated
    if (result[0]?.uniqueCounts) {
      for (const item of result[0].uniqueCounts) {
        const date = item._id.date;
        const dateStats = getOrCreateDateStats(date);

        if (item._id.operationType === "updated") {
          dateStats.aggregatedUpdated = item.count;
        }
      }
    }

    // Process timestamps for time analysis (TypeScript processing)
    if (result[0]?.timestamps) {
      for (const item of result[0].timestamps) {
        const date = item._id;
        const timestamps = item.timestamps.map((ts: Date) => new Date(ts));

        const dateStats = getOrCreateDateStats(date);

        // Sort timestamps
        timestamps.sort((a: Date, b: Date) => a.getTime() - b.getTime());

        // Earliest and latest edit (time only)

        assert(timestamps.length > 0, "Timestamps array should not be empty");

        const earliestTimestamp = timestamps[0];
        const latestTimestamp = timestamps[timestamps.length - 1];

        assert(
          earliestTimestamp !== undefined,
          "Earliest timestamp must exist",
        );
        assert(latestTimestamp !== undefined, "Latest timestamp must exist");

        dateStats.earliestEdit = earliestTimestamp.toISOString();
        dateStats.latestEdit = latestTimestamp.toISOString();

        // Estimated work time (in minutes)
        const workTimeMs =
          latestTimestamp.getTime() - earliestTimestamp.getTime();
        dateStats.estimatedWorkTime = Math.round(workTimeMs / 1000 / 60);

        // Average time between entries (in minutes)
        if (timestamps.length > 1) {
          let totalGapMs = 0;
          let biggestGapMs = 0;
          for (let i = 1; i < timestamps.length; i++) {
            const currentTimestamp = timestamps[i];
            const previousTimestamp = timestamps[i - 1];

            assert(
              currentTimestamp !== undefined,
              "Current timestamp must exist",
            );
            assert(
              previousTimestamp !== undefined,
              "Previous timestamp must exist",
            );

            const gapMs =
              currentTimestamp.getTime() - previousTimestamp.getTime();
            totalGapMs += gapMs;
            biggestGapMs = Math.max(biggestGapMs, gapMs);
          }
          const avgGapMs = totalGapMs / (timestamps.length - 1);
          dateStats.averageTimeBetweenEntries = Math.round(
            avgGapMs / 1000 / 60,
          );
          dateStats.biggestGapBetweenEntries = Math.round(
            biggestGapMs / 1000 / 60,
          );
        } else {
          dateStats.averageTimeBetweenEntries = 0;
          dateStats.biggestGapBetweenEntries = 0;
        }
      }
    }

    // Convert map to array and sort by date
    const dailyStats = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const auditOverview = {
      userEmail,
      model,
      ...(dateFrom && { dateStart: dateFrom }),
      ...(dateTo && { dateEnd: dateTo }),
      dailyStats,
    };

    const auditStats = calculateStatistics(dailyStats, dateFrom, dateTo);
    return {
      ...auditOverview,
      ...auditStats,
    };
  } catch (error) {
    console.error("Error getting user changes by date", error);
    throw new Error("Error getting user changes by date");
  }
};

const calculateStatistics = (
  dailyStats: Array<DailyStat>,
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
): AuditLogOverviewStats => {
  const totalNew = dailyStats.reduce((sum, day) => sum + day.new, 0);

  const totalDeleted = dailyStats.reduce((sum, day) => sum + day.deleted, 0);

  const totalUpdated = dailyStats.reduce(
    (sum, day) => sum + day.aggregatedUpdated,
    0,
  );

  if (!dateFrom || !dateTo || dailyStats.length === 0) {
    return {
      totalNew,
      totalDeleted,
      totalUpdated,
      averageUpdatesPerDay: 0,
      averageEditStartTime: "Nema podataka",
      averageEditEndTime: "Nema podataka",
      averageEstimatedWorkTime: 0,
      averageTimeBetweenEntries: 0,
      averageTimeForGreatestGap: 0,
      totalWorkedDays: 0,
      totalUnworkedDays: 0,
    };
  }

  const numberOfBusinessDays = differenceInBusinessDays(dateTo, dateFrom) + 1;

  const countUnworkedDays = () => {
    const workedDates = new Set(dailyStats.map((day) => day.date));

    return Math.max(0, numberOfBusinessDays - workedDates.size);
  };

  const averageUpdatesPerDay =
    dailyStats.length > 0
      ? Number((totalUpdated / dailyStats.length).toFixed(2))
      : 0;

  const averageEditStartTime = (() => {
    if (dailyStats.length === 0) return "Nema podataka";
    const totalMinutes = dailyStats.reduce((sum, day) => {
      if (!day.earliestEdit) return sum;
      const date = new Date(day.earliestEdit);
      return sum + date.getHours() * 60 + date.getMinutes();
    }, 0);

    const avgMinutes = totalMinutes / dailyStats.length;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  })();

  const averageEditEndTime = (() => {
    if (dailyStats.length === 0) return "Nema podataka";
    const totalMinutes = dailyStats.reduce((sum, day) => {
      if (!day.latestEdit) return sum;
      const date = new Date(day.latestEdit);
      return sum + date.getHours() * 60 + date.getMinutes();
    }, 0);

    const avgMinutes = totalMinutes / dailyStats.length;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  })();

  const averageEstimatedWorkTime =
    dailyStats.length === 0
      ? 0
      : Math.round(
          dailyStats.reduce(
            (sum, day) => sum + (day.estimatedWorkTime || 0),
            0,
          ) / dailyStats.length,
        );

  const averageTimeBetweenEntries =
    dailyStats.length > 0
      ? Math.round(
          dailyStats.reduce(
            (sum, day) => sum + (day.averageTimeBetweenEntries || 0),
            0,
          ) / dailyStats.length,
        )
      : 0;

  const averageTimeForGreatestGap =
    dailyStats.length > 0
      ? Math.round(
          dailyStats.reduce(
            (sum, day) => sum + (day.biggestGapBetweenEntries || 0),
            0,
          ) / dailyStats.length,
        )
      : 0;

  return {
    totalNew,
    totalDeleted,
    totalUpdated,
    averageUpdatesPerDay,
    averageEditStartTime,
    averageEditEndTime,
    averageEstimatedWorkTime,
    averageTimeBetweenEntries,
    averageTimeForGreatestGap,
    totalWorkedDays: dailyStats.length,
    totalUnworkedDays: countUnworkedDays(),
  };
};
