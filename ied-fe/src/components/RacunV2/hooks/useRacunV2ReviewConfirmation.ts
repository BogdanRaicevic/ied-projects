import { useCallback, useEffect, useState } from "react";
import { useFormState } from "react-hook-form";
import { useRacunV2Form } from "./useRacunV2Form";

type RacunV2ReviewStatus = "needs-review" | "confirmed";

export type RacunV2ReviewConfirmation = {
  status: RacunV2ReviewStatus;
  isValidating: boolean;
  /**
   * Run a full-form validation pass. On success, transitions to
   * `"confirmed"`; on failure, stays in `"needs-review"`. Returns the
   * validation result so callers can branch on it (e.g. show a toast).
   */
  confirm: () => Promise<boolean>;
};

/**
 * Two-step submit gate for RacunV2.
 *
 * **Step 1 — `confirm()`:** runs RHF `trigger()` over the entire form.
 * The form is in `mode: "onBlur"` (see `RacunV2FormProvider`), so
 * untouched fields don't appear in `errors` until the user visits them
 * — meaning the SummaryPanel's "0 grešaka" can be misleading on a
 * pristine form. `trigger()` validates regardless of touched state, so
 * the resulting `errors` and the boolean outcome both reflect reality.
 *
 * **Step 2 — submit:** consumed by the `<form>` in `RacunV2Content`.
 * The "Generiši račun" button is a normal `type="submit"`; this hook
 * just gates whether it's enabled.
 *
 * **Self-invalidation:** any field edit after a successful `confirm()`
 * flips `status` back to `"needs-review"` via a `watch` subscription.
 * This is the entire point of the two-button gate — without it the
 * user could confirm, edit a field, and then submit stale-validated
 * data. With it, the submit button is only reachable while the
 * confirmed snapshot is still current.
 */
export function useRacunV2ReviewConfirmation(): RacunV2ReviewConfirmation {
  const { control, trigger, watch } = useRacunV2Form();
  const { isValidating } = useFormState({ control });
  const [status, setStatus] = useState<RacunV2ReviewStatus>("needs-review");

  useEffect(() => {
    if (status !== "confirmed") return;
    // `watch(callback)` fires on value changes (typing, setValue, reset,
    // field-array ops). It does NOT fire for `trigger()` since validation
    // doesn't mutate values — so this won't loop with `confirm()` itself.
    const subscription = watch(() => {
      setStatus("needs-review");
    });
    return () => subscription.unsubscribe();
  }, [status, watch]);

  const confirm = useCallback(async () => {
    const ok = await trigger();
    setStatus(ok ? "confirmed" : "needs-review");
    return ok;
  }, [trigger]);

  return { status, isValidating, confirm };
}
