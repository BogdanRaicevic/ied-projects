import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addZaposleniToFirma,
  deleteZaposleniFromFirma,
  updateZaposleniInFirma,
} from "../../api/firma.api";
import type { FirmaType, Zaposleni } from "../../schemas/firmaSchemas";

const firmaQueryKey = (firmaId: string) => ["firma", firmaId];

export const useAddZaposleni = (firmaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zaposleniData: Partial<Zaposleni>) => {
      return await addZaposleniToFirma(firmaId, zaposleniData);
    },
    onMutate: async (newZaposleni) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: firmaQueryKey(firmaId) });

      // Snapshot the previous value
      const previousFirma = queryClient.getQueryData<FirmaType>(
        firmaQueryKey(firmaId),
      );

      // Optimistically update to the new value
      if (previousFirma) {
        queryClient.setQueryData<FirmaType>(firmaQueryKey(firmaId), {
          ...previousFirma,
          zaposleni: [...previousFirma.zaposleni, newZaposleni as Zaposleni],
        });
      }

      // Return a context object with the snapshotted value
      return { previousFirma };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newZaposleni, context) => {
      if (context?.previousFirma) {
        queryClient.setQueryData<FirmaType>(
          firmaQueryKey(firmaId),
          context.previousFirma,
        );
      }
    },
    // Always refetch after error or success to ensure server state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: firmaQueryKey(firmaId) });
    },
  });
};

export const useUpdateZaposleni = (firmaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zaposleni: Partial<Zaposleni>) => {
      if (!zaposleni._id)
        throw new Error("Zaposleni ID is required for update");
      return await updateZaposleniInFirma(firmaId, zaposleni._id, zaposleni);
    },
    onMutate: async (updatedZaposleni) => {
      await queryClient.cancelQueries({ queryKey: firmaQueryKey(firmaId) });
      const previousFirma = queryClient.getQueryData<FirmaType>(
        firmaQueryKey(firmaId),
      );

      if (previousFirma) {
        queryClient.setQueryData<FirmaType>(firmaQueryKey(firmaId), {
          ...previousFirma,
          zaposleni: previousFirma.zaposleni.map((z) =>
            z._id === updatedZaposleni._id ? { ...z, ...updatedZaposleni } : z,
          ),
        });
      }
      return { previousFirma };
    },
    onError: (_err, _updatedZaposleni, context) => {
      if (context?.previousFirma) {
        queryClient.setQueryData<FirmaType>(
          firmaQueryKey(firmaId),
          context.previousFirma,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: firmaQueryKey(firmaId) });
    },
  });
};

export const useDeleteZaposleni = (firmaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zaposleniId: string) => {
      return await deleteZaposleniFromFirma(firmaId, zaposleniId);
    },
    onMutate: async (zaposleniId) => {
      await queryClient.cancelQueries({ queryKey: firmaQueryKey(firmaId) });
      const previousFirma = queryClient.getQueryData<FirmaType>(
        firmaQueryKey(firmaId),
      );

      if (previousFirma) {
        queryClient.setQueryData<FirmaType>(firmaQueryKey(firmaId), {
          ...previousFirma,
          zaposleni: previousFirma.zaposleni.filter(
            (z) => z._id !== zaposleniId,
          ),
        });
      }
      return { previousFirma };
    },
    onError: (_err, _zaposleniId, context) => {
      if (context?.previousFirma) {
        queryClient.setQueryData<FirmaType>(
          firmaQueryKey(firmaId),
          context.previousFirma,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: firmaQueryKey(firmaId) });
    },
  });
};
