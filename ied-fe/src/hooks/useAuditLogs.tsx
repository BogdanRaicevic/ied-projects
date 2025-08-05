import type { AuditLogType } from "@ied-shared/types/audit_log.zod";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceWithAuth from "../api/interceptors/auth";

type AuditLogsResponse = {
  data: AuditLogType[];
  totalDocuments: number;
  totalPages: number;
};

export const useAuditLogs = () => {
  return useQuery<AuditLogsResponse>({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const res = await axiosInstanceWithAuth.get<AuditLogsResponse>("/api/audit-log");
      return res.data;
    },
  });
};
