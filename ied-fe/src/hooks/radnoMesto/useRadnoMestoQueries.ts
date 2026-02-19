import { useQuery } from "@tanstack/react-query";
import { fetchAllRadnaMestaNames } from "../../api/radno_mesto.api";

export const useGetRadnaMestaNames = () => {
  return useQuery({
    queryKey: ["radnaMesta", "names"],
    queryFn: () => fetchAllRadnaMestaNames(),
  });
};

export const useGetRadnaMesta = () => {
  return useQuery({
    queryKey: ["radnaMesta", "all"],
    queryFn: () => fetchAllRadnaMestaNames(),
  });
};
