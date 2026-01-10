import type { SuppressedEmail, SuppressionReasons } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const addEmailToSuppressionList = async (email: string) => {
  try {
    const suppressedEmail: SuppressedEmail = { email, reason: "UNSUBSCRIBED" };

    const response = await axiosInstanceWithAuth.put(
      `/api/email-suppression/add-email`,
      suppressedEmail,
    );
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error setting email to unsubscribed: ", error);
    throw error;
  }
};

export const removeEmailFromSuppressionList = async (email: string) => {
  try {
    const response = await axiosInstanceWithAuth.delete(
      `/api/email-suppression/remove-email`,
      { data: { email } },
    );
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error removing email from suppression list: ", error);
    throw error;
  }
};

export const checkIfEmailIsSuppressed = async (
  email: string,
): Promise<SuppressionReasons | null> => {
  try {
    const response = await axiosInstanceWithAuth.get(
      `/api/email-suppression/check-status`,
      { params: { email } },
    );

    return response.data;
  } catch (error) {
    console.error("Error checking if email is suppressed: ", error);
    throw error;
  }
};
