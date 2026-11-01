import { useQuery } from "@tanstack/react-query";
import type { PretragaType } from "ied-shared";
import { fetchAllPretrage } from "../../api/pretrage.api";

export const usePretrage = () =>
  useQuery<PretragaType[]>({
    queryKey: ["pretrage"],
    queryFn: fetchAllPretrage,
    // Saved pretrage are shared by all users; pick up others' changes.
    refetchOnMount: true,
  });
