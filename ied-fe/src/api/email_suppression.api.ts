import type { SuppressedEmail, SuppressionReasons } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const addEmailToSuppressionList = async (email: string) => {
  const suppressedEmail: SuppressedEmail = { email, reason: "UNSUBSCRIBED" };

  const response = await axiosInstanceWithAuth.put(
    `/api/email-suppression/add-email`,
    suppressedEmail,
  );
  return {
    data: response.data,
    status: response.status,
  };
};

export const removeEmailFromSuppressionList = async (email: string) => {
  const response = await axiosInstanceWithAuth.delete(
    `/api/email-suppression/remove-email`,
    { data: { email } },
  );
  return {
    data: response.data,
    status: response.status,
  };
};

export const checkIfEmailIsSuppressed = async (
  email: string,
): Promise<SuppressionReasons | null> => {
  const response = await axiosInstanceWithAuth.get(
    `/api/email-suppression/check-status`,
    { params: { email } },
  );

  return response.data;
};
