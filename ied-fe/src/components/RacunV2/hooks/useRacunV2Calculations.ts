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
import { useRacunV2Form } from "./useRacunV2Form";

const EMPTY_LINKED_AVANSI: ReadonlyArray<RacunV2KonacniDeduction> = [];

/**
 * Subscribes to RHF form state via `watch` and returns memoized totals +
 * per-stavka subtotals. Pure projection — never mutates the form. Phase 3
 * will replace EMPTY_LINKED_AVANSI with real linked-avansni amounts; the
 * shape this hook returns does not change.
 */
export const useRacunV2Calculations = () => {
  const { watch } = useRacunV2Form();

  const tipRacuna = watch("tipRacuna", TipRacuna.PREDRACUN);
  const izdavacRacuna = watch("izdavacRacuna", IzdavacRacuna.IED);
  const stavke = watch("stavke", []);
  const placeno = watch("placeno", 0);
  const avansBezPdv = watch("avansBezPdv", 0);
  // Avansni invoices have no stavke; their PDV rate lives on the invoice.
  // Defaults to 20 in the schema; hook reads from form state.
  const stopaPdvAvansni = watch("stopaPdvAvansni", 20);

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
