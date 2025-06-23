import { useQuery } from "@tanstack/react-query";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { fetchAllMesta } from "../api/mesta.api";
import { fetchAllRadnaMesta } from "../api/radna_mesto.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";
import { fetchAllStanjaFirme } from "../api/stanja_firme.api";
import { fetchAllSeminars, fetchSeminari } from "../api/seminari.api";
import { addMonths, subMonths } from "date-fns";
import { getIzdavaciRacuna } from "../api/racuni.api";

export function useFetchData() {
	const { data: delatnosti } = useQuery({
		queryKey: ["delatnosti"],
		queryFn: fetchAllDelatnosti,
	});

	const { data: mesta } = useQuery({
		queryKey: ["mesta"],
		queryFn: fetchAllMesta,
	});

	const { data: radnaMesta } = useQuery({
		queryKey: ["radnaMesta"],
		queryFn: fetchAllRadnaMesta,
	});

	const { data: tipoviFirme } = useQuery({
		queryKey: ["tipoviFirme"],
		queryFn: fetchAllTipoviFirme,
	});

	const { data: velicineFirme } = useQuery({
		queryKey: ["velicineFirme"],
		queryFn: fetchAllVelicineFirme,
	});

	const { data: stanjaFirme } = useQuery({
		queryKey: ["stanjaFirme"],
		queryFn: fetchAllStanjaFirme,
	});

	const { data: sviSeminari } = useQuery({
		queryKey: ["sviSeminari"],
		queryFn: fetchAllSeminars,
	});

	return {
		delatnosti,
		mesta,
		radnaMesta,
		tipoviFirme,
		velicineFirme,
		stanjaFirme,
		sviSeminari,
	};
}

export function useFetchSeminari() {
	const { data: fetchedSeminars } = useQuery({
		queryKey: ["fetchedSeminars"],
		queryFn: () => {
			// TODO: use variables for pageSize and pageIndex
			return fetchSeminari(50, 0, {
				// TODO: need to use only subDays(-7) to allow late registration
				datumOd: subMonths(new Date(), 3),
				datumDo: addMonths(new Date(), 3),
			});
		},
	});

	return { fetchedSeminars };
}

export const useFetchIzdavaciRacuna = () => {
	return useQuery({
		queryKey: ["izdavaciRacuna"],
		queryFn: () => {
			return getIzdavaciRacuna();
		},
	});
};
