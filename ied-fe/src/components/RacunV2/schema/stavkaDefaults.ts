import type { StavkaProizvodV2Form, StavkaUslugaV2Form } from "ied-shared";

/**
 * Empty-stavka factories used by `StavkeSection` when the user clicks an
 * "Add" button. Per Story 5.1.2:
 *
 * - `stopaPdv` snapshots `defaultStopaPdv` at append time. It is NOT
 *   reactively re-synced when `defaultStopaPdv` changes later — each stavka
 *   has its own editable per-stavka rate (Story 5.2.5 / 5.3.3).
 * - `jedinicaMere` defaults differ per type: usluga = "Broj ucesnika",
 *   proizvod = "Broj primeraka". Hardcoded for usluga (no UI per 5.2.6),
 *   editable for proizvod (text input per 5.3.2).
 *
 * Numeric fields default to `0` (not `undefined`) so RHF's `Controller`
 * sees a stable value from the start; users overwrite as they type. `datum`
 * defaults to `null` to match MUI DatePicker convention for "no selection".
 *
 * The Zod schema uses `z.coerce.{number,date}` whose `z.input` type is
 * `unknown`, so these literal values typecheck cleanly against the form
 * types even though the parsed shapes are stricter.
 */

export const getEmptyUslugaStavka = (
  defaultStopaPdv: number,
): StavkaUslugaV2Form => ({
  tipStavke: "usluga",
  naziv: "",
  datum: null,
  lokacija: "",
  jedinicaMere: "Broj ucesnika",
  onlineKolicina: 0,
  onlineCena: 0,
  offlineKolicina: 0,
  offlineCena: 0,
  popust: 0,
  stopaPdv: defaultStopaPdv,
});

export const getEmptyProizvodStavka = (
  defaultStopaPdv: number,
): StavkaProizvodV2Form => ({
  tipStavke: "proizvod",
  naziv: "",
  jedinicaMere: "Broj primeraka",
  kolicina: 0,
  cena: 0,
  popust: 0,
  stopaPdv: defaultStopaPdv,
});
