import { useQuery } from "@tanstack/react-query";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { fetchAllMesta } from "../api/mesta.api";
import { fetchAllRadnaMesta } from "../api/radna_mesto.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";
import { fetchAllStanjaFirme } from "../api/stanja_firme.api";

export function useFetchData() {
  const { data: delatnosti } = useQuery({ queryKey: ["delatnosti"], queryFn: fetchAllDelatnosti });

  const { data: mesta } = useQuery({ queryKey: ["mesta"], queryFn: fetchAllMesta });

  const { data: radnaMesta } = useQuery({ queryKey: ["radnaMesta"], queryFn: fetchAllRadnaMesta });

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

  return { delatnosti, mesta, radnaMesta, tipoviFirme, velicineFirme, stanjaFirme };
}
