import { useQuery } from "react-query";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { fetchAllMesta } from "../api/mesta.api";
import { fetchAllRadnaMesta } from "../api/radna_mesto.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";
import { fetchAllStanjaFirme } from "../api/stanja_firme.api";

export function useFetchData() {
  const { data: delatnosti } = useQuery("delatnosti", fetchAllDelatnosti);
  const { data: mesta } = useQuery("mesta", fetchAllMesta);
  const { data: radnaMesta } = useQuery("radnaMesta", fetchAllRadnaMesta);
  const { data: tipoviFirme } = useQuery("tipoviFirme", fetchAllTipoviFirme);
  const { data: velicineFirme } = useQuery("velicineFirme", fetchAllVelicineFirme);
  const { data: stanjaFirme } = useQuery("stanjaFirme", fetchAllStanjaFirme);

  return { delatnosti, mesta, radnaMesta, tipoviFirme, velicineFirme, stanjaFirme };
}
