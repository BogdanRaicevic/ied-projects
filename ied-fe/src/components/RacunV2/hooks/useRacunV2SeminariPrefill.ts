import type { PrijavaZodType } from "ied-shared";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchSingleFirma } from "../../../api/firma.api";
import { fetchSeminarById } from "../../../api/seminari.api";
import {
  buildPrefillFromSeminari,
  type RacunV2SeminariPrefill,
} from "../schema/buildPrefillFromSeminari";

/**
 * Shape of the nav state that the "Kreiraj V2 račun" button on
 * `PrijaveSeminarTable` writes into `react-router`'s location state. Mirrors
 * V1's convention (`{ prijave, seminarId }`) so the same handler shape works
 * for both flows; `firmaId` is intentionally NOT carried separately because
 * it's already implicit in `prijave[0].firma_id` and duplicating it would
 * just create a "which one wins?" question on drift.
 */
export type RacunV2SeminariNavState = {
  seminarId: string;
  prijave: PrijavaZodType[];
};

/**
 * Three-state machine that the page renders against:
 *
 * - `"loading"`: nav state is present, fetches in flight. Page shows a
 *   loading indicator and does NOT mount the form provider yet (avoids any
 *   `reset()` dance once data lands).
 * - `"ready"`: either no nav state (immediate, blank-form path), or the
 *   fetches have all settled. Page mounts the provider with `prefill` if it
 *   was successfully built; otherwise mounts blank with an `errorMessage`
 *   surfaced in an Alert.
 *
 * No explicit `"error"` state — error is just `"ready" + errorMessage` so the
 * form is still usable on partial data failures (graceful degradation; the
 * user can fall back to manual entry rather than being trapped on a dead
 * page).
 */
export type SeminariPrefillStatus = "loading" | "ready";

export type SeminariPrefillResult = {
  status: SeminariPrefillStatus;
  prefill?: RacunV2SeminariPrefill;
  errorMessage?: string;
};

/**
 * Reads `react-router` location state, fetches the firma + seminar in
 * parallel, and produces a ready-to-merge `RacunV2SeminariPrefill` for
 * `RacunV2FormProvider`. Page-level orchestrator for ticket 7.2.3.
 *
 * **Why a hook (not just an inline effect in the page):** keeps the page
 * component focused on layout (loading / error / mounted-form) and isolates
 * the cancellable async machinery so it's reusable if a second entry point
 * ever needs the same prefill (e.g. "Kreiraj V2 račun" on a future
 * Seminari-detail page).
 *
 * **Cancellation:** the in-flight fetch is gated through a local `cancelled`
 * flag rather than `AbortSignal` because `axiosInstanceWithAuth` doesn't
 * surface a signal API today. The flag prevents the late-arriving response
 * from clobbering state after the page has unmounted (or after the user has
 * navigated within the page). When axios cancellation is wired more broadly
 * across the app, this hook can switch over without touching its consumers.
 */
export function useRacunV2SeminariPrefill(): SeminariPrefillResult {
  const location = useLocation();
  // `location.state` is a stable reference per navigation in react-router v6,
  // so any field reads off it are stable until the next navigation. We
  // capture the raw object (not destructured-with-defaults) for the effect
  // deps so the effect re-runs ONLY on navigation, not on every render.
  const navState = location.state as RacunV2SeminariNavState | null;
  const seminarId = navState?.seminarId ?? "";
  const firmaId = navState?.prijave?.[0]?.firma_id ?? "";
  const hasNavState = Boolean(seminarId && firmaId);

  const [status, setStatus] = useState<SeminariPrefillStatus>(
    hasNavState ? "loading" : "ready",
  );
  const [prefill, setPrefill] = useState<RacunV2SeminariPrefill | undefined>(
    undefined,
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!navState || !hasNavState) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [firma, seminar] = await Promise.all([
          fetchSingleFirma(firmaId),
          fetchSeminarById(seminarId),
        ]);
        if (cancelled) return;
        setPrefill(
          buildPrefillFromSeminari({
            firma,
            seminar,
            prijave: navState.prijave,
          }),
        );
      } catch (error) {
        if (cancelled) return;
        console.error("[RacunV2 prefill] Seminari fetch failed:", error);
        setErrorMessage(
          "Greška pri učitavanju podataka firme ili seminara. Forma je otvorena prazna — molimo unesite podatke ručno.",
        );
      } finally {
        if (!cancelled) setStatus("ready");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navState, hasNavState, seminarId, firmaId]);

  return { status, prefill, errorMessage };
}
