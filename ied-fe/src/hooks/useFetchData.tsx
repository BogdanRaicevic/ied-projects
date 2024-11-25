import { useQuery } from "react-query";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { fetchAllMesta } from "../api/mesta.api";
import { fetchAllRadnaMesta } from "../api/radna_mesto.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";
import { fetchAllStanjaFirme } from "../api/stanja_firme.api";
import { useAuth } from "@clerk/clerk-react";

export function useFetchData() {
  const { getToken } = useAuth();

  const { data: delatnosti } = useQuery("delatnosti", async () => {
    const token = await getToken();
    return fetchAllDelatnosti(token);
  });

  const { data: mesta } = useQuery("mesta", async () => {
    const token = await getToken();
    return fetchAllMesta(token);
  });

  const { data: radnaMesta } = useQuery("radnaMesta", async () => {
    const token = await getToken();
    return fetchAllRadnaMesta(token);
  });

  const { data: tipoviFirme } = useQuery("tipoviFirme", async () => {
    const token = await getToken();
    return fetchAllTipoviFirme(token);
  });

  const { data: velicineFirme } = useQuery("velicineFirme", async () => {
    const token = await getToken();
    return fetchAllVelicineFirme(token);
  });

  const { data: stanjaFirme } = useQuery("stanjaFirme", async () => {
    const token = await getToken();
    return fetchAllStanjaFirme(token);
  });

  return { delatnosti, mesta, radnaMesta, tipoviFirme, velicineFirme, stanjaFirme };
}
