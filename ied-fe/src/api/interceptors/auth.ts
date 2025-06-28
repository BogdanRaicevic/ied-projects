import axios from "axios";
import { getClerkToken } from "../../utils/clerkClient";

const axiosInstanceWithAuth = axios.create({
  baseURL: import.meta.env.VITE_BE_URL,
});

axiosInstanceWithAuth.interceptors.request.use(
  async (config) => {
    const token = await getClerkToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstanceWithAuth;
