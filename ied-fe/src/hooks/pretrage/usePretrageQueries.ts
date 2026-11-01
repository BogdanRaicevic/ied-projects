import { useQuery } from "@tanstack/react-query";
import type { PretragaType } from "ied-shared";
import { fetchAllPretrage } from "../../api/pretrage.api";
import { pretrageKeys } from "../queryKeys";

export const usePretrage = () =>
  useQuery<PretragaType[]>({
    queryKey: pretrageKeys.all,
    queryFn: fetchAllPretrage,
    // Saved pretrage are shared by all users; pick up others' changes.
    refetchOnMount: true,
  });
