import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import type { TipSeminaraFromDB } from "ied-shared";
import { fetchAllTipoviSeminara } from "../../api/tip_seminara.api";
import { tipSeminaraKeys } from "../queryKeys";

export function useFetchTipoviSeminara(): UseQueryResult<TipSeminaraFromDB[]> {
  return useQuery({
    queryKey: tipSeminaraKeys.all,
    queryFn: async () => {
      const response = await fetchAllTipoviSeminara();
      return response;
    },
  });
}
