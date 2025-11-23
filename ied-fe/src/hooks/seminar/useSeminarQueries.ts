import { useQuery } from "@tanstack/react-query";
import { addMonths, subMonths } from "date-fns";
import { fetchFirmaSeminari, fetchSeminari } from "../../api/seminari.api";

export function useFetchSeminari() {
  const { data: fetchedSeminars } = useQuery({
    queryKey: ["fetchedSeminars"],
    queryFn: () => {
      // TODO: use variables for pageSize and pageIndex
      return fetchSeminari(50, 0, {
        datumOd: subMonths(new Date(), 3),
        datumDo: addMonths(new Date(), 3),
      });
    },
  });

  return { fetchedSeminars };
}

export function useFetchFirmaSeminari() {
  const { data: fetchedFirmaSeminars } = useQuery({
    queryKey: ["fetchedFirmaSeminars"],
    queryFn: () => {
      return fetchFirmaSeminari(50, 0, {});
    },
  });

  return { fetchedFirmaSeminars };
}
