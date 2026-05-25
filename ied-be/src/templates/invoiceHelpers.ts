/**
 * Pure helper functions used by invoice templates. Registered with Handlebars
 * in `invoiceRenderer.ts`; intentionally have zero knowledge of Handlebars
 * itself so they stay easy to unit-test and reuse outside the templating
 * pipeline (e.g. CSV/JSON exports).
 *
 * Two groups live here:
 *   1. Number/date formatters (`formatMoney`, `formatDate`, …) — stateless,
 *      pure-by-input string output.
 *   2. Domain helpers (`cenaPoJedinici`, `pdvLabel`, `qrSrc`) — operate on
 *      view-model shapes from `invoiceRenderer.ts`.
 */

import { format as formatDateFns } from "date-fns";
import type { StavkaUslugaV2Parsed } from "ied-shared";
import type { InvoiceTemplateData } from "./invoiceRenderer";

// ---------------------------------------------------------------------------
// Number / date / pct formatters
// ---------------------------------------------------------------------------

const SR_LATN = "sr-Latn-RS";

// Quantity formatter: flexible decimals (0-2) for counts (e.g. broj učesnika,
// količina) where "3" and "3,5" both read naturally. Used by the partials for
// non-monetary cells.
const quantityFormatter = new Intl.NumberFormat(SR_LATN, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// Money formatter: Serbian/RSD accounting style — always two decimals, dot as
// thousands separator, comma as decimal separator. `17107` → `17.107,00`.
// Used everywhere a monetary value is rendered (cena, osnovica, PDV, totals).
const moneyFormatter = new Intl.NumberFormat(SR_LATN, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatQuantity = (value: unknown): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "0";
  return quantityFormatter.format(num);
};

export const formatMoney = (value: unknown): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "0,00";
  return moneyFormatter.format(num);
};

export const formatMoneyRsd = (value: unknown): string =>
  `${formatMoney(value)} RSD`;

export const formatPercent = (value: unknown): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return `${quantityFormatter.format(num)}%`;
};

export const formatDate = (value: unknown): string => {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return formatDateFns(date, "dd.MM.yyyy");
};

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------

export const cenaPoJedinici = (stavka: unknown): string => {
  // Usluga has onlineCena/offlineCena; this helper is only invoked from the
  // usluga partial, so we trust the shape but guard defensively.
  if (!stavka || typeof stavka !== "object") return "";
  const s = stavka as Partial<StavkaUslugaV2Parsed>;
  const online = Number(s.onlineCena ?? 0);
  const offline = Number(s.offlineCena ?? 0);

  // Both zero — show a single "0,00".
  if (online === 0 && offline === 0) return formatMoney(0);
  // Only one set — show it alone.
  if (online === 0) return formatMoney(offline);
  if (offline === 0) return formatMoney(online);
  // Both present and equal — single value.
  if (online === offline) return formatMoney(online);
  // Both present and different — show as "X / Y".
  return `${formatMoney(online)} / ${formatMoney(offline)}`;
};

export const pdvLabel = (pdvPoStopama: unknown): string => {
  if (!pdvPoStopama || typeof pdvPoStopama !== "object") return "PDV";
  const keys = Object.keys(pdvPoStopama as Record<string, unknown>);
  if (keys.length === 1) {
    return `PDV (${keys[0]}%)`;
  }
  // Mixed rates — drop the percent so the displayed label doesn't mislead.
  return "PDV";
};

// TODO: create a real QR code generator
const buildPlaceholderQrUrl = (data: InvoiceTemplateData): string => {
  const ukupno = Math.round(data.totals.ukupnaNaknada);
  const params = [
    "BCD",
    "001",
    "1",
    "ICT",
    `${data.valuta}${ukupno}`,
    data.uplata.tekuciRacun,
    data.uplata.banka,
    data.pozivNaBroj,
    "Predracun",
  ].join("\n");
  const encoded = encodeURIComponent(params);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encoded}`;
};

export const qrSrc = (data: InvoiceTemplateData): string => {
  if (data.qrCodeDataUrl) return data.qrCodeDataUrl;
  return buildPlaceholderQrUrl(data);
};
