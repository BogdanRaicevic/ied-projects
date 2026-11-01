import { useQuery } from "@tanstack/react-query";
import type { MestoFromDBType } from "ied-shared";
import { fetchAllMesta, fetchAllMestaNames } from "../../api/mesto.api";
import { mestoKeys } from "../queryKeys";

export const useGetMestaNames = () => {
  return useQuery<string[], Error>({
    queryKey: mestoKeys.names(),
    queryFn: () => fetchAllMestaNames(),
  });
};

export const useGetMesta = () => {
  return useQuery<MestoFromDBType[], Error>({
    queryKey: mestoKeys.all,
    queryFn: () => fetchAllMesta(),
  });
};
