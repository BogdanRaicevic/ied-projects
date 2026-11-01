import { getToken } from "@clerk/react";
import axios from "axios";
import { env } from "../../utils/envVariables";

const axiosInstanceWithAuth = axios.create({
  baseURL: env.beURL,
});

axiosInstanceWithAuth.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// One place to log failed requests; callers get the original AxiosError.
// Log only safe fields: error.config holds the Authorization header.
axiosInstanceWithAuth.interceptors.response.use(undefined, (error) => {
  console.error(
    `API ${error.config?.method?.toUpperCase()} ${error.config?.url} failed:`,
    error.response?.status ?? error.code,
    error.message,
  );
  return Promise.reject(error);
});

export default axiosInstanceWithAuth;
