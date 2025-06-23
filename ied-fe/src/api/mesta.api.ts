import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllMesta = async () => {
	try {
		const response = await axiosInstanceWithAuth.get(`/api/mesto/all-names`);
		return response.data;
	} catch (error) {
		console.error("Error fetching mesta:", error);
		throw error;
	}
};
