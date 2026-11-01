import { useQuery } from "@tanstack/react-query";
import {
  fetchAllRadnaMesta,
  fetchAllRadnaMestaNames,
} from "../../api/radno_mesto.api";
import { radnoMestoKeys } from "../queryKeys";

export const useGetRadnaMestaNames = () => {
  return useQuery({
    queryKey: radnoMestoKeys.names(),
    queryFn: () => fetchAllRadnaMestaNames(),
  });
};

export const useGetRadnaMesta = () => {
  return useQuery({
    queryKey: radnoMestoKeys.all,
    queryFn: () => fetchAllRadnaMesta(),
  });
};
