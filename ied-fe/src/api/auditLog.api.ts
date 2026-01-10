import type {
  AuditLogQueryParams,
  AuditLogStatsByDateResponse,
  AuditLogType,
} from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export type AuditLogsResponse = {
  data: AuditLogType[];
  totalDocuments: number;
  totalPages: number;
};

export const getAuditLogData = async ({
  pageSize,
  pageIndex,
  params,
}: {
  pageSize: number;
  pageIndex: number;
  params: AuditLogQueryParams;
}): Promise<AuditLogsResponse> => {
  try {
    const res = await axiosInstanceWithAuth.get<AuditLogsResponse>(
      "/api/audit-log",
      {
        params: {
          pageSize,
          pageIndex,
          ...params,
        },
      },
    );
    return res.data;
  } catch (error) {
    throw new Error(`Error fetching audit log data: ${(error as any).message}`);
  }
};

export const getAuditLogStats = async ({
  params,
}: {
  params: AuditLogQueryParams;
}): Promise<AuditLogStatsByDateResponse> => {
  try {
    const res = await axiosInstanceWithAuth.get<AuditLogStatsByDateResponse>(
      "/api/audit-log/user-changes-by-date",
      {
        params,
      },
    );
    return res.data;
  } catch (error) {
    throw new Error(
      `Error fetching audit log stats: ${(error as any).message}`,
    );
  }
};
