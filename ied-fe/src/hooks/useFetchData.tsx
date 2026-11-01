import { useQuery } from "@tanstack/react-query";
import type { IzdavacRacunaOption } from "ied-shared";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { getIzdavaciRacuna } from "../api/racuni.api";
import { fetchAllStanjaFirme } from "../api/stanja_firme.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";
import {
  delatnostKeys,
  izdavacRacunaKeys,
  stanjeFirmeKeys,
  tipFirmeKeys,
  velicinaFirmeKeys,
} from "./queryKeys";

export function useFetchPretragaData() {
  const { data: delatnosti } = useQuery({
    queryKey: delatnostKeys.all,
    queryFn: fetchAllDelatnosti,
  });

  const { data: tipoviFirme } = useQuery({
    queryKey: tipFirmeKeys.all,
    queryFn: fetchAllTipoviFirme,
  });

  const { data: velicineFirme } = useQuery({
    queryKey: velicinaFirmeKeys.all,
    queryFn: fetchAllVelicineFirme,
  });

  const { data: stanjaFirme } = useQuery({
    queryKey: stanjeFirmeKeys.all,
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
    queryKey: izdavacRacunaKeys.all,
    queryFn: (): Promise<IzdavacRacunaOption[]> => getIzdavaciRacuna(),
  });
};
