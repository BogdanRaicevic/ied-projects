import { Button } from "@mui/material";
import PageTitle from "../components/PageTitle";
import { updateRacunTemplate } from "../api/docx.api";
import { useLocation } from "react-router-dom";
import RacunForm from "../components/Racun/RacunForm";
import { fetchSingleFirmaData } from "../api/firma.api";
import { useEffect, useState } from "react";
import type {
	FirmaType,
	PrijavaNaSeminar,
	SeminarType,
} from "../schemas/firmaSchemas";
import { fetchSeminarById } from "../api/seminari.api";

export default function Racuni() {
	const [firma, setFirma] = useState<FirmaType | null>(null);
	const [seminar, setSeminar] = useState<SeminarType | null>(null);

	const location = useLocation();
	const prijave: PrijavaNaSeminar[] = location.state?.prijave || [];

	useEffect(() => {
		const fetchFirma = async () => {
			try {
				// Fetch firma
				if (prijave[0]?.firma_id) {
					const firmaData = await fetchSingleFirmaData(prijave[0].firma_id);
					setFirma(firmaData);
				}

				// Fetch seminar
				if (prijave[0]?.seminar_id) {
					const seminarData = await fetchSeminarById(prijave[0].seminar_id);
					setSeminar(seminarData);
				}
			} catch (error) {
				console.error("Error:", error);
			}
		};

		fetchFirma();
	}, [prijave]);

	const primalacRacuna = {
		naziv: firma?.naziv_firme || "",
		adresa: firma?.adresa || "",
		pib: firma?.PIB || "",
		maticniBroj: firma?.maticni_broj || "",
		onlineCena: seminar?.onlineCena || "",
		offlineCena: seminar?.offlineCena || "",
		brojUcesnikaOnline:
			prijave.filter((p) => p.prisustvo === "online").length || "",
		brojUcesnikaOffline:
			prijave.filter((p) => p.prisustvo === "offline").length || "",
		ukupanBrojUcesnika: prijave.length || "",
		nazivSeminara: seminar?.naziv || "",
	};
	return (
		<>
			<PageTitle title={"Racuni"} />
			<RacunForm primalacRacuna={primalacRacuna} />
			<Button onClick={updateRacunTemplate} variant="contained">
				odje click
			</Button>
		</>
	);
}
