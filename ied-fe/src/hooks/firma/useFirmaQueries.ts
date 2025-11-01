import { useQuery } from "@tanstack/react-query";
import type { FirmaType } from "ied-shared";
import { fetchSingleFirma } from "../../api/firma.api";

const firmaQueryKey = (firmaId?: string) => ["firma", firmaId];

export const useGetFirma = (firmaId?: string) => {
  return useQuery<FirmaType, Error>({
    // If firmaId is undefined, the key will be ['firma', undefined].
    // The query will remain inactive until the key changes.
    queryKey: firmaQueryKey(firmaId),
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
