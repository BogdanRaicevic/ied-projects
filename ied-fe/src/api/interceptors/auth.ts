import axios from "axios";
import { useAuthStore } from "../../store/auth.store";
import { env } from "../../utils/envVariables";

const axiosInstanceWithAuth = axios.create({
  baseURL: env.beURL,
});

axiosInstanceWithAuth.interceptors.request.use(
  async (config) => {
    config.headers.Authorization = `Bearer ${useAuthStore.getState().token}`;
    return config;
  },
  (error) => {
    return error;
  }
);

export default axiosInstanceWithAuth;
