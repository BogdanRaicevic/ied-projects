import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SeminarZodType } from "ied-shared/dist/types/seminar.zod";
import {
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
    },
  });
}
