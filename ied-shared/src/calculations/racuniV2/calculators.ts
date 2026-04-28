import { TipRacuna } from "../../types/racuni.zod";
import type {
  StavkaProizvodV2Parsed,
  StavkaUslugaV2Parsed,
} from "../../types/racuniV2.zod";

/**
 * Pure calculators for racuni V2. No FE-only deps, no DOM refs — both the FE
 * (via useRacunV2Calculations) and Phase 2 BE will import these directly.
 *
 * Convention: every calculator takes a {@link RacunV2CalculationContext}.
 * When `pdvObveznik === false`, every per-stavka `stopaPdv` is forced to `0`
 * internally — callers don't have to remember.
 */

export type RacunV2CalculationContext = {
  pdvObveznik: boolean;
};

/**
 * Calculator inputs intentionally mark numeric/date fields as `unknown` —
 * the FE feeds these from RHF's `watch()` which returns raw form state
 * before Zod parse runs. The {@link _AssertUslugaCompatible} block below is
 * a compile-time guard that fails if the Zod schema's parsed shape diverges
 * from what these calculators consume (catches drift between the schema and
 * the calculators without forcing the FE to deal with parsed-only types).
 */
export type UslugaStavkaCalculationInput = {
  tipStavke: "usluga";
  naziv: string;
  seminar_id?: string;
  datum?: unknown;
  lokacija?: string;
  jedinicaMere?: string;
  onlineKolicina?: unknown;
  onlineCena?: unknown;
  offlineKolicina?: unknown;
  offlineCena?: unknown;
  popust?: unknown;
  stopaPdv?: unknown;
};

export type ProizvodStavkaCalculationInput = {
  tipStavke: "proizvod";
  naziv: string;
  jedinicaMere?: string;
  kolicina?: unknown;
  cena?: unknown;
  popust?: unknown;
  stopaPdv?: unknown;
};

export type StavkaCalculationInput =
  | UslugaStavkaCalculationInput
  | ProizvodStavkaCalculationInput;

// Drift guards: if anyone changes the Zod schema in a way that the
// calculators can no longer handle, these fail to compile. Cheaper than a
// runtime test, gives us the "single source of truth" intent without
// fighting RHF's loose form-state typing.
type _AssertUslugaCompatible =
  StavkaUslugaV2Parsed extends UslugaStavkaCalculationInput ? true : never;
type _AssertProizvodCompatible =
  StavkaProizvodV2Parsed extends ProizvodStavkaCalculationInput ? true : never;
const _uslugaDriftGuard: _AssertUslugaCompatible = true;
const _proizvodDriftGuard: _AssertProizvodCompatible = true;
void _uslugaDriftGuard;
void _proizvodDriftGuard;

export type RacunV2Subtotal = {
  bruto: number;
  popustIznos: number;
  poreskaOsnovica: number;
  pdv: number;
  ukupno: number;
};

export type RacunV2StavkaSubtotal = RacunV2Subtotal & {
  tipStavke: "usluga" | "proizvod";
  naziv: string;
  stopaPdv: number;
};

export type RacunV2PdvBreakdown = Record<
  string,
  { osnovica: number; pdv: number }
>;

/**
 * Sum of avans amounts deducted from a konacni's totals. Phase 1 returns
 * zeros (stub); Phase 3 wires real linked-avansni data through the same
 * shape via {@link RacunV2InvoiceExtras.konacniDeduction}.
 */
export type RacunV2KonacniDeduction = {
  avans: number;
  avansPdv: number;
  avansBezPdv: number;
};

/**
 * Result of deriving avansPdv + avans from a user-typed avansBezPdv at a
 * given PDV rate. Same shape as {@link RacunV2KonacniDeduction} today, but
 * semantically distinct — keeping them apart so a future change to one
 * doesn't silently bleed into the other.
 */
export type RacunV2AvansDerived = {
  avans: number;
  avansPdv: number;
  avansBezPdv: number;
};

export type RacunV2InvoiceTotals = {
  ukupnaPoreskaOsnovica: number;
  ukupanPdv: number;
  ukupnaNaknada: number;
  ukupnoPreOdbitaka: number;
  odbitak: number;
  pdvPoStopama: RacunV2PdvBreakdown;
  stavkaSubtotali: RacunV2StavkaSubtotal[];
};

export type RacunV2InvoiceExtras = {
  placeno?: unknown;
  konacniDeduction?: RacunV2KonacniDeduction;
};

export const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const toNonNegativeNumber = (value: unknown): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
};

const resolveStopaPdv = (
  stopaPdv: unknown,
  context: RacunV2CalculationContext,
): number => {
  if (!context.pdvObveznik) {
    return 0;
  }

  return toNonNegativeNumber(stopaPdv);
};

const calculateSubtotal = (
  brutoInput: unknown,
  popustInput: unknown,
  stopaPdvInput: unknown,
  context: RacunV2CalculationContext,
): RacunV2Subtotal => {
  const bruto = roundToTwoDecimals(toNonNegativeNumber(brutoInput));
  const popust = Math.min(100, toNonNegativeNumber(popustInput));
  const stopaPdv = resolveStopaPdv(stopaPdvInput, context);

  const popustIznos = roundToTwoDecimals((bruto * popust) / 100);
  const poreskaOsnovica = roundToTwoDecimals(bruto - popustIznos);
  const pdv = roundToTwoDecimals((poreskaOsnovica * stopaPdv) / 100);
  const ukupno = roundToTwoDecimals(poreskaOsnovica + pdv);

  return {
    bruto,
    popustIznos,
    poreskaOsnovica,
    pdv,
    ukupno,
  };
};

export const calcSeminarStavkaSubtotal = (
  stavka: UslugaStavkaCalculationInput,
  context: RacunV2CalculationContext,
): RacunV2Subtotal => {
  const onlineBruto = roundToTwoDecimals(
    toNonNegativeNumber(stavka.onlineKolicina) *
      toNonNegativeNumber(stavka.onlineCena),
  );
  const offlineBruto = roundToTwoDecimals(
    toNonNegativeNumber(stavka.offlineKolicina) *
      toNonNegativeNumber(stavka.offlineCena),
  );

  return calculateSubtotal(
    onlineBruto + offlineBruto,
    stavka.popust,
    stavka.stopaPdv,
    context,
  );
};

export const calcProizvodStavkaSubtotal = (
  stavka: ProizvodStavkaCalculationInput,
  context: RacunV2CalculationContext,
): RacunV2Subtotal => {
  const bruto = roundToTwoDecimals(
    toNonNegativeNumber(stavka.kolicina) * toNonNegativeNumber(stavka.cena),
  );

  return calculateSubtotal(bruto, stavka.popust, stavka.stopaPdv, context);
};

/**
 * Phase 1 stub: konacni deduction is always zero. Phase 3 swaps the body to
 * actually sum across linked avansni; the public signature stays the same.
 */
export const calcKonacniDeduction = (
  _linkedAvansniAmounts: ReadonlyArray<RacunV2KonacniDeduction>,
): RacunV2KonacniDeduction => {
  return {
    avans: 0,
    avansPdv: 0,
    avansBezPdv: 0,
  };
};

export const calcInvoiceTotals = (
  stavke: readonly StavkaCalculationInput[] | undefined,
  context: RacunV2CalculationContext,
  tipRacuna: TipRacuna,
  extras: RacunV2InvoiceExtras = {},
): RacunV2InvoiceTotals => {
  const stavkaSubtotali: RacunV2StavkaSubtotal[] = (stavke ?? []).map(
    (stavka) => {
      const subtotal =
        stavka.tipStavke === "usluga"
          ? calcSeminarStavkaSubtotal(stavka, context)
          : calcProizvodStavkaSubtotal(stavka, context);

      return {
        ...subtotal,
        tipStavke: stavka.tipStavke,
        naziv: stavka.naziv,
        stopaPdv: resolveStopaPdv(stavka.stopaPdv, context),
      };
    },
  );

  const pdvPoStopama: RacunV2PdvBreakdown = {};
  let osnovicaTotal = 0;
  let pdvTotal = 0;
  let ukupnoPreOdbitaka = 0;

  for (const subtotal of stavkaSubtotali) {
    const key = String(subtotal.stopaPdv);

    osnovicaTotal = roundToTwoDecimals(
      osnovicaTotal + subtotal.poreskaOsnovica,
    );
    pdvTotal = roundToTwoDecimals(pdvTotal + subtotal.pdv);
    ukupnoPreOdbitaka = roundToTwoDecimals(ukupnoPreOdbitaka + subtotal.ukupno);

    const existing = pdvPoStopama[key] ?? { osnovica: 0, pdv: 0 };
    pdvPoStopama[key] = {
      osnovica: roundToTwoDecimals(
        existing.osnovica + subtotal.poreskaOsnovica,
      ),
      pdv: roundToTwoDecimals(existing.pdv + subtotal.pdv),
    };
  }

  const konacniDeduction =
    tipRacuna === TipRacuna.KONACNI_RACUN
      ? (extras.konacniDeduction ?? calcKonacniDeduction([]))
      : calcKonacniDeduction([]);
  const placeno =
    tipRacuna === TipRacuna.RACUN ? toNonNegativeNumber(extras.placeno) : 0;

  // Both the avans (konacni) and placeno (racun) deductions reduce only
  // ukupnaNaknada via `odbitak`; ukupnaPoreskaOsnovica and ukupanPdv are
  // always the FULL stavke aggregates (pre-deduction). This keeps the
  // displayed math honest: `osnovica + pdv - odbitak === ukupnaNaknada`,
  // so Pregled can render the avans as an explicit line item without
  // double-counting. V1's konacni pre-subtracted avansBezPdv from base and
  // avansPdv from PDV, then displayed only the final `ukupnaNaknada` — that
  // worked there because V1 never displayed the avans deduction explicitly.
  // V2 does, so the calculator returns primitives and the UI composes the
  // story it wants. (Phase 2 DOCX templates can still re-derive a
  // post-deducted base/PDV from these primitives if a printed račun needs
  // that view.)
  const ukupnaPoreskaOsnovica = osnovicaTotal;
  const ukupanPdv = pdvTotal;

  const odbitak = roundToTwoDecimals(konacniDeduction.avans + placeno);
  const ukupnaNaknada = roundToTwoDecimals(ukupnoPreOdbitaka - odbitak);

  return {
    ukupnaPoreskaOsnovica,
    ukupanPdv,
    ukupnaNaknada,
    ukupnoPreOdbitaka,
    odbitak,
    pdvPoStopama,
    stavkaSubtotali,
  };
};

export const calcAvansDerived = (
  avansBezPdvInput: unknown,
  stopaPdvInput: unknown,
  context: RacunV2CalculationContext,
): RacunV2AvansDerived => {
  const avansBezPdv = roundToTwoDecimals(toNonNegativeNumber(avansBezPdvInput));
  const stopaPdv = resolveStopaPdv(stopaPdvInput, context);
  const avansPdv = roundToTwoDecimals((avansBezPdv * stopaPdv) / 100);
  const avans = roundToTwoDecimals(avansBezPdv + avansPdv);

  return {
    avansBezPdv,
    avansPdv,
    avans,
  };
};
