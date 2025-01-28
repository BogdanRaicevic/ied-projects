import axios from "axios";
import { env } from "../../utils/envVariables";
import { Clerk } from "@clerk/clerk-js";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerk = new Clerk(PUBLISHABLE_KEY);
await clerk.load();

const axiosInstanceWithAuth = axios.create({
	baseURL: env.beURL,
});

axiosInstanceWithAuth.interceptors.request.use(
	async (config) => {
		const token = await clerk.session?.getToken();

		if (!token) {
			return Promise.reject(new Error("No authentication token"));
		}

		config.headers.Authorization = `Bearer ${token}`;
		return config;
	},
	(error) => {
		console.error("Auth error:", error);
		return Promise.reject(error);
	},
);

export default axiosInstanceWithAuth;
