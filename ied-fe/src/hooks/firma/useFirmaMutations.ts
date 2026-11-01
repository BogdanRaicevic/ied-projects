import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ContactTypeEnum, FirmaType, ZaposleniType } from "ied-shared";
import { useNavigate } from "react-router-dom";
import {
  addZaposleniToFirma,
  createNewFirma,
  deleteFirma,
  deleteZaposleniFromFirma,
  updateFirma,
  updateLastContactInFirma,
  updateZaposleniInFirma,
} from "../../api/firma.api";
import { firmaKeys } from "../queryKeys";

/**
 * Mutation to CREATE a new Firma.
 * On success, it invalidates the list of firms to trigger a refetch
 * and navigates to the new firma's detail page.
 */
export const useCreateNewFirma = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (firmaData: Partial<FirmaType>) => {
      const response = await createNewFirma(firmaData);
      return response.data; // Ensure this matches Partial<FirmaType>
    },

    onSuccess: (data: Partial<FirmaType>) => {
      // `data` is the new Firma object returned from the API, including its new _id.

      // (Optional but good UX) Navigate to the new firma's page.
      if (data?._id) {
        navigate(`/firma/${data._id}`);
      }
    },

    onError: (error) => {
      // Handle any creation errors, e.g., show a toast notification.
      console.error("Error creating new firma:", error);
    },
  });
};

export const useUpdateFirma = (firmaId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (firmaData: Partial<FirmaType>) => {
      if (!firmaId) {
        throw new Error("Firma ID is required for update");
      }
      const updatedFirma = await updateFirma(firmaId, firmaData);
      return updatedFirma.data; // Ensure this matches Partial<FirmaType>
    },
    onMutate: async (updatedFirma) => {
      if (!firmaId) {
        return;
      }
      await queryClient.cancelQueries({ queryKey: firmaKeys.detail(firmaId) });
      const previousFirma = queryClient.getQueryData<FirmaType>(
        firmaKeys.detail(firmaId),
      );

      if (previousFirma) {
        queryClient.setQueryData<FirmaType>(firmaKeys.detail(firmaId), {
          ...previousFirma,
          ...updatedFirma,
        });
      }
      return { previousFirma };
    },
    onError: (_err, _updatedFirma, context) => {
      if (!firmaId) {
        return;
      }
      if (context?.previousFirma) {
        queryClient.setQueryData<FirmaType>(
          firmaKeys.detail(firmaId),
          context.previousFirma,
        );
      }
    },
    onSettled: () => {
      if (!firmaId) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: firmaKeys.detail(firmaId) });
    },
  });
};

export const useDeleteFirma = (firmaId: string | null) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Initialize navigate

  return useMutation({
    mutationFn: async () => {
      if (!firmaId) {
        throw new Error("Firma ID is required for deletion");
      }
      return await deleteFirma(firmaId);
    },
    onSuccess: () => {
      // 1. Invalidate the list of firms so it refetches on the next page.
      queryClient.invalidateQueries({ queryKey: firmaKeys.searches() });
      // 2. Navigate the user away from the page of the deleted item.
      navigate("/pretrage"); // Or your main list route
    },
    onError: (error) => {
      console.error("Error deleting firma:", error);
    },
  });
};

export const useAddZaposleni = (firmaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zaposleniData: Partial<ZaposleniType>) => {
      return await addZaposleniToFirma(firmaId, zaposleniData);
    },
    onMutate: async (newZaposleni) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: firmaKeys.detail(firmaId) });

      // Snapshot the previous value
      const previousFirma = queryClient.getQueryData<FirmaType>(
        firmaKeys.detail(firmaId),
      );

      // Optimistically update to the new value
      if (previousFirma) {
        queryClient.setQueryData<FirmaType>(firmaKeys.detail(firmaId), {
          ...previousFirma,
          zaposleni: [
            ...(previousFirma.zaposleni || []),
            newZaposleni as ZaposleniType,
          ],
        });
      }

      // Return a context object with the snapshotted value
      return { previousFirma };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newZaposleni, context) => {
      if (context?.previousFirma) {
        queryClient.setQueryData<FirmaType>(
          firmaKeys.detail(firmaId),
          context.previousFirma,
        );
      }
    },
    // Always refetch after error or success to ensure server state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: firmaKeys.detail(firmaId) });
    },
  });
};

export const useUpdateZaposleni = (firmaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      zaposleni: Partial<ZaposleniType> & { firmaKomentar?: string },
    ) => {
      if (!zaposleni._id)
        throw new Error("Zaposleni ID is required for update");
      return await updateZaposleniInFirma(firmaId, zaposleni._id, zaposleni);
    },
    onMutate: async (updatedZaposleni) => {
      await queryClient.cancelQueries({ queryKey: firmaKeys.detail(firmaId) });
      const firma = queryClient.getQueryData<FirmaType>(
        firmaKeys.detail(firmaId),
      );

      if (firma) {
        const newFirmaState = {
          ...firma,
          komentar:
            updatedZaposleni.firmaKomentar !== undefined
              ? updatedZaposleni.firmaKomentar
              : firma.komentar,
          // Update the specific employee in the array
          zaposleni: (firma.zaposleni || []).map((z) =>
            z._id === updatedZaposleni._id ? { ...z, ...updatedZaposleni } : z,
          ),
        };

        queryClient.setQueryData<FirmaType>(
          firmaKeys.detail(firmaId),
          newFirmaState,
        );
      }
      return { previousFirma: firma };
    },
    onError: (_err, _updatedZaposleni, context) => {
      if (context?.previousFirma) {
        queryClient.setQueryData<FirmaType>(
          firmaKeys.detail(firmaId),
          context.previousFirma,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: firmaKeys.detail(firmaId) });
    },
  });
};

export const useDeleteZaposleni = (firmaId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zaposleniId?: string) => {
      if (!firmaId) {
        throw new Error("Firma ID is required for update");
      }

      if (!zaposleniId) {
        throw new Error("Zaposleni ID is required");
      }
      const response = await deleteZaposleniFromFirma(firmaId, zaposleniId);
      return response.data;
    },
    onMutate: async (zaposleniId) => {
      if (!firmaId) {
        throw new Error("Firma ID is required for update");
      }
      if (!zaposleniId) {
        throw new Error("Zaposleni ID is required");
      }
      await queryClient.cancelQueries({ queryKey: firmaKeys.detail(firmaId) });
      const previousFirma = queryClient.getQueryData<FirmaType>(
        firmaKeys.detail(firmaId),
      );

      if (previousFirma) {
        queryClient.setQueryData<FirmaType>(firmaKeys.detail(firmaId), {
          ...previousFirma,
          zaposleni: (previousFirma.zaposleni || []).filter(
            (z) => z._id !== zaposleniId,
          ),
        });
      }
      return { previousFirma };
    },
    onError: (_err, _zaposleniId, context) => {
      if (!firmaId) {
        throw new Error("Firma ID is required for update");
      }
      if (context?.previousFirma) {
        queryClient.setQueryData<FirmaType>(
          firmaKeys.detail(firmaId),
          context.previousFirma,
        );
      }
    },
    onSettled: () => {
      if (!firmaId) {
        throw new Error("Firma ID is required for update");
      }
      queryClient.invalidateQueries({ queryKey: firmaKeys.detail(firmaId) });
    },
  });
};

export const useAddLastContact = (firmaId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactType: ContactTypeEnum) => {
      if (!firmaId) {
        throw new Error("Firma ID is required for last contact update");
      }
      const response = await updateLastContactInFirma(firmaId, contactType);
      return response.data;
    },
    onSuccess: () => {
      if (!firmaId) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: firmaKeys.detail(firmaId) });
    },
    onError: (error) => {
      console.error("Error updating last contact in firma:", error);
    },
  });
};
