import axios from "axios";
import { env } from "../../utils/envVariables";
import { getClerkToken } from "../../utils/clerkClient";

const axiosInstanceWithAuth = axios.create({
  baseURL: env.beURL,
});

axiosInstanceWithAuth.interceptors.request.use(
  async (config) => {
    const token = await getClerkToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstanceWithAuth;
