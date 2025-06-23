import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllDelatnosti = async () => {
	try {
		const response = await axiosInstanceWithAuth.get(`/api/delatnost`);
		return response.data;
	} catch (error) {
		console.error("Error fetching delatnosti:", error);
		throw error;
	}
};
