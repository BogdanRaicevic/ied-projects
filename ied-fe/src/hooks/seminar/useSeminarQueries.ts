import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import type {
  FirmaSeminarResult,
  FirmaSeminarSearchParams,
  SeminarQueryParams,
  SeminarSearchResults,
} from "ied-shared";
import { fetchFirmaSeminari, fetchSeminari } from "../../api/seminari.api";
import { seminarKeys } from "../queryKeys";

export function useSearchSeminari(params: {
  pageSize: number;
  pageIndex: number;
  queryParameters: SeminarQueryParams;
}): UseQueryResult<SeminarSearchResults> {
  const { pageSize, pageIndex, queryParameters } = params;

  return useQuery({
    queryKey: seminarKeys.search({ pageSize, pageIndex, queryParameters }),
    queryFn: () => fetchSeminari(pageSize, pageIndex, queryParameters),
  });
}

export function useSearchFirmaSeminari(params: {
  pageSize: number;
  pageIndex: number;
  queryParameters: FirmaSeminarSearchParams;
}): UseQueryResult<FirmaSeminarResult> {
  const { pageSize, pageIndex, queryParameters } = params;

  return useQuery({
    queryKey: seminarKeys.firmaSeminari({
      pageSize,
      pageIndex,
      queryParameters,
    }),
    queryFn: () => fetchFirmaSeminari(pageSize, pageIndex, queryParameters),
  });
}
