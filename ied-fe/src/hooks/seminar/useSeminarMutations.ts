import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PrijavaZodType, SeminarZodType } from "ied-shared";
import {
  createPrijava,
  createSeminar,
  deletePrijava,
  deleteSeminar,
  updateSeminar,
} from "../../api/seminari.api";

export function useDeleteSeminarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSeminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seminari"] });
    },
  });
}

export function useCreateSeminarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seminarData: SeminarZodType) => createSeminar(seminarData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seminari"] });
    },
  });
}

export function useUpdateSeminarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seminarData: SeminarZodType) => updateSeminar(seminarData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seminari"] });
    },
  });
}

export function useDeletePrijavaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zaposleniId,
      seminarId,
    }: {
      zaposleniId: string;
      seminarId: string;
    }) => deletePrijava(zaposleniId, seminarId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seminari"] });
      queryClient.invalidateQueries({ queryKey: ["firma-seminari"] });
    },
  });
}

export function useCreatePrijavaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      seminarId,
      prijava,
    }: {
      seminarId: string;
      prijava: PrijavaZodType;
    }) => createPrijava(seminarId, prijava),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seminari"] });
      queryClient.invalidateQueries({ queryKey: ["firma-seminari"] });
    },
  });
}
