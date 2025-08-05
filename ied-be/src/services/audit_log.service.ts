import type { AuditLogQueryParams } from "@ied-shared/types/audit_log.zod";
import { AuditLog } from "./../models/audit_log.model";
import { createAuditLogQuery } from "../utils/auditLogQueryBuilder";

export const getAuditLogs = async (
    pageIndex: number = 0,
    pageSize: number = 50,
    filterParams: AuditLogQueryParams = {},
) => {
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
        throw new Error("Error finding audit log");
    }
};
