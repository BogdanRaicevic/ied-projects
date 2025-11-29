import { useQuery } from "@tanstack/react-query";
import type { SeminarQueryParams } from "ied-shared/dist/types/seminar.zod";
import { fetchFirmaSeminari, fetchSeminari } from "../../api/seminari.api";

export function useFetchFirmaSeminari() {
  const { data: fetchedFirmaSeminars } = useQuery({
    queryKey: ["firma-seminari"],
    queryFn: () => {
      return fetchFirmaSeminari(50, 0, {});
    },
  });

  return { fetchedFirmaSeminars };
}

export function useSearchSeminari(params: {
  pageSize: number;
  pageIndex: number;
  queryParameters: SeminarQueryParams;
}) {
  const { pageSize, pageIndex, queryParameters } = params;

  return useQuery({
    queryKey: ["seminari", { pageSize, pageIndex, filters: queryParameters }],
    queryFn: () => fetchSeminari(pageSize, pageIndex, queryParameters),
  });
}

export function useSearchFirmaSeminari(params: {
  pageSize: number;
  pageIndex: number;
  queryParameters: SeminarQueryParams;
}) {
  const { pageSize, pageIndex, queryParameters } = params;

  const { data: firmaSeminars, isLoading } = useQuery({
    queryKey: [
      "firma-seminari",
      { pageSize, pageIndex, filters: queryParameters },
    ],
    queryFn: () => fetchFirmaSeminari(pageSize, pageIndex, queryParameters),
  });

  return { firmaSeminars, isLoading };
}
