import { useQuery } from "@tanstack/react-query";
import axiosInstanceWithAuth from "../api/interceptors/auth";

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const res = await axiosInstanceWithAuth.get("/api/audit-logs");
      return res.data;
    },
  });
};
