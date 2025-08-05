import { useQuery } from "@tanstack/react-query";
import axiosInstanceWithAuth from "../api/interceptors/auth";

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const res = await axiosInstanceWithAuth.get("/api/audit-log");
      return res.data;
    },
  });
};
