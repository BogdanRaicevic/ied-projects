import { SUPPRESSION_REASONS } from "ied-shared";
import { useCallback, useEffect, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import {
  addEmailToSuppressionList,
  checkIfEmailIsSuppressed,
  removeEmailFromSuppressionList,
} from "../../api/email_suppression.api";

export const useEmailSuppression = (
  email: string | undefined,
  setValue: UseFormSetValue<any>,
  opts: { autoInit?: boolean } = { autoInit: true },
) => {
  const [suppressionWarning, setSuppressionWarning] = useState<string | null>(
    null,
  );

  const handleEmailChange = useCallback(async () => {
    if (!email) {
      setSuppressionWarning(null);
      return;
    }

    try {
      const suppressed = await checkIfEmailIsSuppressed(email);
      if (suppressed === SUPPRESSION_REASONS.UNSUBSCRIBED) {
        setSuppressionWarning(
          "Ovaj email je na listi za odjavu. Možete ga ponovo prijaviti.",
        );
        setValue("prijavljeni", false);
      } else if (
        suppressed === SUPPRESSION_REASONS.HARD_BOUNCE ||
        suppressed === SUPPRESSION_REASONS.SPAM_COMPLAINT
      ) {
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

  const handleMailingListChange = useCallback(
    async (newValue: boolean) => {
      if (!email) {
        setValue("prijavljeni", newValue);
        return;
      }

      try {
        const status = await checkIfEmailIsSuppressed(email);
        if (status && status !== SUPPRESSION_REASONS.UNSUBSCRIBED) {
          console.error(`Cannot subscribe ${email}. Reason: ${status}`);
          setValue("prijavljeni", false);
          return;
        }

        if (newValue === false) {
          await addEmailToSuppressionList(email);
          setValue("prijavljeni", false);
        } else {
          await removeEmailFromSuppressionList(email);
          setValue("prijavljeni", true);
        }
        await handleEmailChange();
      } catch (error) {
        console.error("Error handling mailing list change:", error);
        await handleEmailChange();
        throw error;
      }
    },
    [email, setValue, handleEmailChange],
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
    withEmailBlur,
  };
};
