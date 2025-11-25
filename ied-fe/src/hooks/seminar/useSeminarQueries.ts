import { useQuery } from "@tanstack/react-query";
import { addMonths, subMonths } from "date-fns";
import type { SeminarQueryParams } from "ied-shared/dist/types/seminar.zod";
import { fetchFirmaSeminari, fetchSeminari } from "../../api/seminari.api";

// TODO: merge with useSearchSeminari
export function useFetchSeminari() {
  const { data: fetchedSeminars } = useQuery({
    queryKey: ["seminari"],
    queryFn: () => {
      // TODO: use variables for pageSize and pageIndex
      return fetchSeminari(50, 0, {
        datumOd: subMonths(new Date(), 3),
        datumDo: addMonths(new Date(), 3),
      });
    },
  });

  return { fetchedSeminars };
}

export function useFetchFirmaSeminari() {
  const { data: fetchedFirmaSeminars } = useQuery({
    queryKey: ["seminari"],
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

  const { data: seminars, isLoading } = useQuery({
    queryKey: ["seminari", { pageSize, pageIndex, filters: queryParameters }],
    queryFn: () => fetchSeminari(pageSize, pageIndex, queryParameters),
  });

  return { seminars, isLoading };
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
