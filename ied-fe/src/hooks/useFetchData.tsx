import type { TipSeminara } from "@ied-shared/types/seminar.zod";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { fetchAllMesta } from "../api/mesta.api";
import { getIzdavaciRacuna } from "../api/racuni.api";
import { fetchAllRadnaMesta } from "../api/radna_mesto.api";
import { fetchAllStanjaFirme } from "../api/stanja_firme.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllTipoviSeminara } from "../api/tip_seminara.api";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";

export function useFetchPretragaData() {
  const { data: delatnosti } = useQuery({
    queryKey: ["delatnosti"],
    queryFn: fetchAllDelatnosti,
  });

  const { data: mesta } = useQuery({
    queryKey: ["mesta"],
    queryFn: fetchAllMesta,
  });

  const { data: radnaMesta, isLoading: isRadnaMestaLoading } = useQuery({
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

  return {
    delatnosti,
    mesta,
    radnaMesta,
    isRadnaMestaLoading,
    tipoviFirme,
    velicineFirme,
    stanjaFirme,
  };
}

export const useFetchIzdavaciRacuna = () => {
  return useQuery({
    queryKey: ["izdavaciRacuna"],
    queryFn: () => {
      return getIzdavaciRacuna();
    },
  });
};

export function useFetchTipoviSeminara(): UseQueryResult<TipSeminara[]> {
  return useQuery({
    queryKey: ["tipoviSeminara"],
    queryFn: async () => {
      const response = await fetchAllTipoviSeminara();
      return response;
    },
  });
}
