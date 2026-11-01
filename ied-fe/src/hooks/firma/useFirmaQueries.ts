import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { FirmaType, ParametriPretrage } from "ied-shared";
import { fetchFirmaPretrage, fetchSingleFirma } from "../../api/firma.api";
import { firmaKeys } from "../queryKeys";

export const useGetFirma = (firmaId?: string) => {
  return useQuery<FirmaType, Error>({
    // If firmaId is undefined, the key will be ['firma', undefined].
    // The query will remain inactive until the key changes.
    queryKey: firmaKeys.detail(firmaId),
    // The query function is only called if `enabled` is true
    queryFn: () => {
      if (!firmaId) {
        return Promise.reject(new Error("firmaId is required"));
      }
      return fetchSingleFirma(firmaId);
    },
    // The `enabled` option prevents the query from running if firmaId is falsy (e.g., undefined, "")
    enabled: !!firmaId,
  });
};

export const useFirmaPretrage = (
  pageIndex: number,
  pageSize: number,
  queryParameters: ParametriPretrage,
) =>
  useQuery({
    queryKey: firmaKeys.search({ pageIndex, pageSize, queryParameters }),
    queryFn: () => fetchFirmaPretrage(pageSize, pageIndex, queryParameters),
    // Firme are edited on another page; refetch on return to show changes.
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
