import { useQuery } from "@tanstack/react-query";
import type { IzdavacRacunaOption } from "ied-shared";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { getIzdavaciRacuna } from "../api/racuni.api";
import { fetchAllStanjaFirme } from "../api/stanja_firme.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";

export function useFetchPretragaData() {
  const { data: delatnosti } = useQuery({
    queryKey: ["delatnosti"],
    queryFn: fetchAllDelatnosti,
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

  return {
    delatnosti,
    tipoviFirme,
    velicineFirme,
    stanjaFirme,
  };
}

export const useFetchIzdavaciRacuna = () => {
  return useQuery({
    queryKey: ["izdavaciRacuna"],
    queryFn: (): Promise<IzdavacRacunaOption[]> => getIzdavaciRacuna(),
  });
};
