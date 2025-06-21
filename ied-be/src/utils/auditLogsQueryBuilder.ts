import { AuditLogQueryParams, AuditLogType } from "@ied-shared/types/audit_log";
import type { FilterQuery } from "mongoose";

export function createAuditLogQuery(params: AuditLogQueryParams): FilterQuery<AuditLogType> {
    const query: FilterQuery<AuditLogType> = {};

    if (params?.userEmail && params.userEmail.length > 0) {
        query.userEmail = { $regex: params.userEmail, $options: "i" }; // Case-insensitive partial match
    }

    if (params?.path && params.path.length > 0) {
        query.path = { $regex: params.path, $options: "i" }; // Case-insensitive partial match
    }

    if (params?.method && params.method.length > 0) {
        query.method = { $regex: params.method, $options: "i" }; // Case-insensitive partial match
    }

    if (params?.datumOd && params?.datumDo) {
        query.timestamp = {
            $gte: params.datumOd,
            $lte: params.datumDo,
        };
    } else if (params?.datumOd) {
        query.timestamp = { $gte: params.datumOd };
    } else if (params?.datumDo) {
        query.timestamp = { $lte: params.datumDo };
    }

    return query;
}
