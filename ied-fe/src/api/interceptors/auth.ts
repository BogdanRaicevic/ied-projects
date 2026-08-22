import { getToken } from "@clerk/react";
import { ClerkOfflineError } from "@clerk/react/errors";
import axios from "axios";
import { env } from "../../utils/envVariables";

const axiosInstanceWithAuth = axios.create({
  baseURL: env.beURL,
});

axiosInstanceWithAuth.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Core 3 throws ClerkOfflineError instead of returning null when
      // offline; send the request without a token rather than failing here
      // (the backend will 401 it, same as any other missing/expired token).
      if (!ClerkOfflineError.is(error)) {
        throw error;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstanceWithAuth;
