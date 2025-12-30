import type { AuditLogQueryParams } from "@ied-shared/types/audit_log.zod";
import type { QueryFilter } from "mongoose";
import type { AuditLogType } from "../models/audit_log.model";

export function createAuditLogQuery(
  params: AuditLogQueryParams,
): QueryFilter<AuditLogType> {
  const query: QueryFilter<AuditLogType> = {};

  if (params?.userEmail && params.userEmail.length > 0) {
    query.userEmail = { $regex: params.userEmail, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.method && params.method.length > 0) {
    query.method = { $regex: params.method, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.model && params.model.length > 0) {
    query["resource.model"] = { $regex: params.model, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.resourceId && params.resourceId.length > 0) {
    query["resource.id"] = { $regex: params.resourceId, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.dateFrom && params?.dateTo) {
    query.timestamp = {
      $gte: params.dateFrom,
      $lte: params.dateTo,
    };
  } else if (params?.dateFrom) {
    query.timestamp = { $gte: params.dateFrom };
  } else if (params?.dateTo) {
    query.timestamp = { $lte: params.dateTo };
  }

  return query;
}
