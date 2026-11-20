import { useQuery } from "@tanstack/react-query";
import type { IzdavacRacuna } from "ied-shared";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { fetchAllIzdavaci } from "../api/izdavac.api";
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
    queryFn: fetchAllIzdavaci,
  });
};

export const useIzdavac = (id: IzdavacRacuna | undefined) =>
  useFetchIzdavaciRacuna().data?.find((izdavac) => izdavac.id === id);
