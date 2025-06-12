import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAuditLogs = async () => {
  try {
    console.log("Fetching audit log");
    const response = await axiosInstanceWithAuth.get(`/api/audit-logs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching audit log:", error);
    throw error;
  }
};
