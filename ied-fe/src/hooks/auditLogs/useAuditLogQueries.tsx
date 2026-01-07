import type { AuditLogQueryParams } from "@ied-shared/types/audit_log.zod";
import { useQuery } from "@tanstack/react-query";
import {
  type AuditLogsResponse,
  getAuditLogData,
  getAuditLogStats,
} from "../../api/auditLog.api";

export const useAuditLogs = ({
  params,
  pageIndex,
  pageSize,
}: {
  params: AuditLogQueryParams;
  pageIndex: number;
  pageSize: number;
}) => {
  return useQuery<AuditLogsResponse>({
    queryKey: ["audit-log", params, pageIndex, pageSize],
    queryFn: () => getAuditLogData({ pageSize, pageIndex, params }),
  });
};

export const useAuditLogStatsByDate = (params: AuditLogQueryParams) => {
  return useQuery({
    queryKey: ["audit-log-stats", params],
    queryFn: () => getAuditLogStats({ params }),
  });
};
