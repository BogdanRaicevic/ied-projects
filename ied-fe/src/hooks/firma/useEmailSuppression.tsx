import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isPermanent, MAILING_STATUS } from "ied-shared";
import { useCallback, useEffect, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import {
  addEmailToSuppressionList,
  checkIfEmailIsSuppressed,
  removeEmailFromSuppressionList,
} from "../../api/email_suppression.api";
import { firmaKeys } from "../queryKeys";

export const useEmailSuppression = (
  email: string | undefined,
  setValue: UseFormSetValue<any>,
  opts: { autoInit?: boolean } = { autoInit: true },
) => {
  const queryClient = useQueryClient();
  const [suppressionWarning, setSuppressionWarning] = useState<string | null>(
    null,
  );

  const handleEmailChange = useCallback(async () => {
    if (!email) {
      setSuppressionWarning(null);
      return;
    }

    try {
      // Status follows the email, also one typed but not saved yet.
      const suppressed = await checkIfEmailIsSuppressed(email);
      setValue("mailing_status", suppressed ?? MAILING_STATUS.SUBSCRIBED);
      if (suppressed === MAILING_STATUS.UNSUBSCRIBED) {
        setSuppressionWarning(
          "Ovaj email je na listi za odjavu. Možete ga ponovo prijaviti.",
        );
      } else if (suppressed && isPermanent(suppressed)) {
        setSuppressionWarning(
          `Ovaj email je u listi za suzbijanje ${suppressed}. Ne možete ga prijaviti na mailing listu.`,
        );
      } else {
        setSuppressionWarning(null);
      }
    } catch {
      setSuppressionWarning(null);
    }
  }, [email, setValue]);

  const { mutate: changeMailingList, isPending } = useMutation({
    mutationFn: ({
      emailToChange,
      newValue,
    }: {
      emailToChange: string;
      newValue: boolean;
    }) =>
      newValue
        ? removeEmailFromSuppressionList(emailToChange)
        : addEmailToSuppressionList(emailToChange),
    onError: (error) => {
      console.error("Error handling mailing list change:", error);
    },
    onSettled: async () => {
      await Promise.all([
        handleEmailChange(),
        // One email can belong to multiple firme/zaposleni.
        queryClient.invalidateQueries({
          queryKey: firmaKeys.all,
          refetchType: "all",
        }),
      ]);
    },
  });

  const handleMailingListChange = useCallback(
    (newValue: boolean) => {
      // The switch is hidden without an email and for bounce/spam; the BE
      // refuses those too (409).
      if (!email) return;

      changeMailingList({ emailToChange: email, newValue });
    },
    [email, changeMailingList],
  );

  // optional automatic re-check on email change
  useEffect(() => {
    if (opts.autoInit && email) {
      handleEmailChange();
    } else if (!email) {
      setSuppressionWarning(null);
    }
  }, [email, opts.autoInit, handleEmailChange]);

  // helper to wrap original onBlur from react-hook-form
  const withEmailBlur = (original?: (e: any) => void) => {
    return async (e: any) => {
      original?.(e);
      await handleEmailChange();
    };
  };

  return {
    suppressionWarning,
    handleMailingListChange,
    handleEmailChange,
    isPending,
    withEmailBlur,
  };
};
