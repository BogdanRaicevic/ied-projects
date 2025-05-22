import axios from "axios";
import { env } from "../../utils/envVariables";
import { clerk, initClerk } from "../../utils/clerkClient";

const axiosInstanceWithAuth = axios.create({
  baseURL: env.beURL,
});

axiosInstanceWithAuth.interceptors.request.use(
  async (config) => {
    await initClerk();
    const token = await clerk.session?.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstanceWithAuth;
