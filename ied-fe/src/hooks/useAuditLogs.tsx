import type { AuditLogQueryParams, AuditLogType } from "@ied-shared/types/audit_log.zod";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceWithAuth from "../api/interceptors/auth";

type AuditLogsResponse = {
  data: AuditLogType[];
  totalDocuments: number;
  totalPages: number;
};

export const useAuditLogs = (
  params: AuditLogQueryParams & { pageIndex: number; pageSize: number },
) => {
  return useQuery<AuditLogsResponse>({
    queryKey: ["audit-log", params],
    queryFn: async () => {
      const res = await axiosInstanceWithAuth.get<AuditLogsResponse>("/api/audit-log", {
        params,
      });
      return res.data;
    },
  });
};
