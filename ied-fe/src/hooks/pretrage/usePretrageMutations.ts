import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ParametriPretrage } from "ied-shared";
import { deletePretraga, savePretraga } from "../../api/pretrage.api";

export const useSavePretraga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      queryParameters: ParametriPretrage;
      pretraga: { id?: string; naziv: string };
    }) => savePretraga(params.queryParameters, params.pretraga),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pretrage"] });
    },
  });
};

export const useDeletePretraga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePretraga,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pretrage"] });
    },
  });
};
