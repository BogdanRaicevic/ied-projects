import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAuditLogs = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/audit-logs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching audit log:", error);
    throw error;
  }
};
