import { useQuery } from "@tanstack/react-query";
import type { MestoFromDBType } from "ied-shared";
import { fetchAllMesta, fetchAllMestaNames } from "../../api/mesto.api";

export const useGetMestaNames = () => {
  return useQuery<string[], Error>({
    queryKey: ["mesta"],
    queryFn: () => fetchAllMestaNames(),
  });
};

export const useGetMesta = () => {
  return useQuery<MestoFromDBType[], Error>({
    queryKey: ["mesta"],
    queryFn: () => fetchAllMesta(),
  });
};
