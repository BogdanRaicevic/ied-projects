import type { FirmaSeminarSearchParams } from "@ied-shared/types/seminar.zod";
import { useQuery } from "@tanstack/react-query";
import type { SeminarQueryParams } from "ied-shared/dist/types/seminar.zod";
import { fetchFirmaSeminari, fetchSeminari } from "../../api/seminari.api";

export function useSearchSeminari(params: {
  pageSize: number;
  pageIndex: number;
  queryParameters: SeminarQueryParams;
}) {
  const { pageSize, pageIndex, queryParameters } = params;

  return useQuery({
    queryKey: ["seminari", { pageSize, pageIndex, queryParameters }],
    queryFn: () => fetchSeminari(pageSize, pageIndex, queryParameters),
  });
}

export function useSearchFirmaSeminari(params: {
  pageSize: number;
  pageIndex: number;
  queryParameters: FirmaSeminarSearchParams;
}) {
  const { pageSize, pageIndex, queryParameters } = params;

  const { data: firmaSeminars, isLoading } = useQuery({
    queryKey: ["firma-seminari", { pageSize, pageIndex, queryParameters }],
    queryFn: () => fetchFirmaSeminari(pageSize, pageIndex, queryParameters),
  });

  return { firmaSeminars, isLoading };
}
