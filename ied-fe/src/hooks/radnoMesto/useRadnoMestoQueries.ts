import { useQuery } from "@tanstack/react-query";
import {
  fetchAllRadnaMesta,
  fetchAllRadnaMestaNames,
} from "../../api/radno_mesto.api";

export const useGetRadnaMestaNames = () => {
  return useQuery({
    queryKey: ["radnaMesta"],
    queryFn: () => fetchAllRadnaMestaNames(),
  });
};

export const useGetRadnaMesta = () => {
  return useQuery({
    queryKey: ["radnaMesta"],
    queryFn: () => fetchAllRadnaMesta(),
  });
};
