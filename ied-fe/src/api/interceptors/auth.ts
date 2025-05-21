import axios from "axios";
import { env } from "../../utils/envVariables";

const axiosInstanceWithAuth = axios.create({
  baseURL: env.beURL,
});

let currentToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;
}

axiosInstanceWithAuth.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstanceWithAuth;
