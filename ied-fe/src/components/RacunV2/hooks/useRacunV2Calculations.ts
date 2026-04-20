import {
  calcAvansDerived,
  calcInvoiceTotals,
  calcKonacniDeduction,
  IzdavacRacuna,
  isIzdavacPdvObveznik,
  type RacunV2KonacniDeduction,
  TipRacuna,
} from "ied-shared";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { useRacunV2Form } from "./useRacunV2Form";

const EMPTY_LINKED_AVANSI: ReadonlyArray<RacunV2KonacniDeduction> = [];

/**
 * Subscribes to RHF form state via `useWatch` and returns memoized totals +
 * per-stavka subtotals. Pure projection — never mutates the form. Phase 3
 * will replace EMPTY_LINKED_AVANSI with real linked-avansni amounts; the
 * shape this hook returns does not change.
 *
 * Uses `useWatch({ control, name })` (not `watch(name)` from
 * `useFormContext`) because `watch` does not reliably re-render on deep
 * array element mutations under discriminated-union schemas — leading to
 * stale totals in SummaryPanel. `useWatch` is the documented reactive API.
 */
export const useRacunV2Calculations = () => {
  const { control } = useRacunV2Form();

  const tipRacuna = useWatch({
    control,
    name: "tipRacuna",
    defaultValue: TipRacuna.PREDRACUN,
  });
  const izdavacRacuna = useWatch({
    control,
    name: "izdavacRacuna",
    defaultValue: IzdavacRacuna.IED,
  });
  const stavke = useWatch({ control, name: "stavke", defaultValue: [] });
  const placeno = useWatch({ control, name: "placeno", defaultValue: 0 });
  const avansBezPdv = useWatch({
    control,
    name: "avansBezPdv",
    defaultValue: 0,
  });
  // Avansni invoices have no stavke; their PDV rate lives on the invoice.
  // Defaults to 20 in the schema; hook reads from form state.
  const stopaPdvAvansni = useWatch({
    control,
    name: "stopaPdvAvansni",
    defaultValue: 20,
  });

  const pdvObveznik = isIzdavacPdvObveznik(izdavacRacuna);
  const context = useMemo(() => ({ pdvObveznik }), [pdvObveznik]);

  const konacniDeduction = useMemo(
    () => calcKonacniDeduction(EMPTY_LINKED_AVANSI),
    [],
  );

  const avansDerived = useMemo(
    () => calcAvansDerived(avansBezPdv, stopaPdvAvansni, context),
    [avansBezPdv, stopaPdvAvansni, context],
  );

  const invoiceTotals = useMemo(
    () =>
      calcInvoiceTotals(stavke, context, tipRacuna, {
        placeno,
        konacniDeduction,
      }),
    [stavke, context, tipRacuna, placeno, konacniDeduction],
  );

  const totals = useMemo(() => {
    if (tipRacuna !== TipRacuna.AVANSNI_RACUN) {
      return invoiceTotals;
    }

    const effectiveStopa = pdvObveznik ? Number(stopaPdvAvansni) || 0 : 0;

    return {
      ...invoiceTotals,
      ukupnaPoreskaOsnovica: avansDerived.avansBezPdv,
      ukupanPdv: avansDerived.avansPdv,
      ukupnaNaknada: avansDerived.avans,
      ukupnoPreOdbitaka: avansDerived.avans,
      odbitak: 0,
      pdvPoStopama: {
        [String(effectiveStopa)]: {
          osnovica: avansDerived.avansBezPdv,
          pdv: avansDerived.avansPdv,
        },
      },
    };
  }, [tipRacuna, invoiceTotals, avansDerived, pdvObveznik, stopaPdvAvansni]);

  return {
    pdvObveznik,
    totals,
    stavkaSubtotali: totals.stavkaSubtotali,
    avansDerived,
    konacniDeduction,
  };
};
