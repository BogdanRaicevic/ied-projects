import { useQuery } from "@tanstack/react-query";
import type { AuditLogQueryParams } from "ied-shared";
import {
  type AuditLogsResponse,
  getAuditLogData,
  getAuditLogStats,
} from "../../api/auditLog.api";
import { auditLogKeys } from "../queryKeys";

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
    queryKey: auditLogKeys.list({ params, pageIndex, pageSize }),
    queryFn: () => getAuditLogData({ pageSize, pageIndex, params }),
  });
};

export const useAuditLogStatsByDate = (params: AuditLogQueryParams) => {
  return useQuery({
    queryKey: auditLogKeys.stats(params),
    queryFn: () => getAuditLogStats({ params }),
  });
};
