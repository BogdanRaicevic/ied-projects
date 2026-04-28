import type { Valuta } from "../../constants/racuni";

/**
 * Single shared money formatter for racuni V2. Used by SummaryPanel today and
 * by Phase 6's DOCX renderer later — Phase 6 changes the body, not the
 * signature.
 *
 * Phase 1 (inert): renders the amount with sr-Latn-RS digit grouping
 * (period thousands, comma decimal — Serbian convention) and appends the
 * currency code as a string suffix. Numbers are NOT converted between
 * currencies; the picker is purely visual until Phase 6.
 *
 * Phase 6 swaps the body for `Intl.NumberFormat({ style: "currency",
 * currency: valuta })` plus NBS exchange-rate handling. The signature and
 * call sites do not change.
 *
 * Defensive: non-finite inputs (NaN, +/-Infinity) format as `0,00 <valuta>`.
 * The V2 calculators always emit finite numbers, but the picker output is
 * displayed live as the user types, so we don't trust the input blindly.
 */
export const formatMoney = (amount: number, valuta: Valuta): string => {
  const safe = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat("sr-Latn-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
  return `${formatted} ${valuta}`;
};
