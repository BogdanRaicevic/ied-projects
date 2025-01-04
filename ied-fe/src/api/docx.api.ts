import axiosInstanceWithAuth from "./interceptors/auth";
import { env } from "../utils/envVariables";

export const updateRacunTemplate = async () => {
	try {
		console.log("updateRacunTemplate");
		const response = await axiosInstanceWithAuth.get(
			`${env.beURL}/api/docx/modify-template`,
			{
				responseType: "blob",
			},
		);
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", "racun.docx");
		document.body.appendChild(link);
		link.click();
	} catch (error) {
		console.error("Error downloading the document:", error);
	}
};
