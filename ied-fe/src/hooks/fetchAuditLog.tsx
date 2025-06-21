import { useQuery } from "@tanstack/react-query";
import axiosInstanceWithAuth from "../api/interceptors/auth";

export const useAuditLogs = ({ pageIndex = 0, pageSize = 50, filterParams = {} }) => {
  return useQuery({
    queryKey: ["audit-logs", pageIndex, pageSize, filterParams],
    queryFn: async () => {
      const res = await axiosInstanceWithAuth.post("/api/audit-logs/search", {
        pageIndex,
        pageSize,
        filterParams,
      });
      return res.data;
    },
  });
};
