import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PretrageRacunaType } from "ied-shared";
import { searchRacuni } from "../../api/racuni.api";
import { racunKeys } from "../queryKeys";

export const useSearchRacuni = (
  pageIndex: number,
  pageSize: number,
  filterValues: PretrageRacunaType,
) =>
  useQuery({
    queryKey: racunKeys.search({ pageIndex, pageSize, filterValues }),
    queryFn: () => searchRacuni(pageIndex, pageSize, filterValues),
    // Računi are created on another page; refetch on return to show them.
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
