import { readFileSync } from "node:fs";
import { join } from "node:path";
import { format as formatDateFns } from "date-fns";
import Handlebars from "handlebars";
import type {
  RacunV2InvoiceTotals,
  RacunV2Subtotal,
  StavkaProizvodV2Parsed,
  StavkaRacunaV2Parsed,
  StavkaUslugaV2Parsed,
} from "ied-shared";

/**
 * Renders a Predračun HTML document from a typed view model.
 *
 * The view model is intentionally distinct from the raw `RacunV2Parsed` Zod
 * shape: it carries derived fields the schema doesn't (full issuer profile,
 * bank name, computed totals) so the template can stay logic-light. A future
 * Phase-2 service builds view models from the persisted data; the preview
 * script hand-builds them today.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type IzdavacProfile = {
  naziv: string;
  adresa: string;
  telefoni: string[];
  pib: string;
  maticniBroj: string;
};

export type PrimalacFirmaView = {
  tipPrimaoca: "firma";
  naziv: string;
  adresa: string;
  pib: string;
  maticniBroj: string;
};

export type PrimalacFizickoView = {
  tipPrimaoca: "fizicko";
  imeIPrezime: string;
  adresa: string;
  jmbg?: string;
};

export type PrimalacView = PrimalacFirmaView | PrimalacFizickoView;

export type UplataView = {
  tekuciRacun: string;
  banka: string;
};

export type PredracunTemplateData = {
  pozivNaBroj: string;
  datum: Date | string;
  mesto: string;
  rokZaUplatu: number;
  valuta: "RSD" | "EUR";
  pdvObveznik: boolean;

  izdavac: IzdavacProfile;
  primalac: PrimalacView;
  uplata: UplataView;

  stavke: StavkaRacunaV2Parsed[];
  totals: RacunV2InvoiceTotals;

  /**
   * Feature gate for the QR payment block. The QR encoder is not yet
   * implemented, so callers pass `false` in production to hide the block
   * entirely. The preview script (and future QR work) can flip this to
   * `true` to render the placeholder/encoded QR image.
   */
  showQrCode: boolean;

  /**
   * Optional pre-encoded QR data URL (e.g. `data:image/png;base64,...`).
   * When omitted (and `showQrCode` is true), the renderer falls back to an
   * api.qrserver.com placeholder that encodes the most relevant payment
   * fields — useful for previews and for environments where real QR
   * generation isn't wired up yet.
   */
  qrCodeDataUrl?: string;
};

export type RenderOptions = {
  /**
   * `"inline"` (default): embeds `invoice.css` content inside a `<style>` tag.
   * Self-contained HTML — works in Puppeteer, email, file attachment.
   *
   * `"link"`: emits `<link rel="stylesheet" href="${cssHref}" />`. Use when
   * the rendered HTML lives next to `invoice.css` (e.g. preview script).
   */
  css?: "inline" | "link";
  /**
   * Used only when `css === "link"`. Defaults to `"./invoice.css"` (assumes
   * the rendered HTML sits in the same directory as `invoice.css`).
   */
  cssHref?: string;
};

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const TEMPLATES_DIR = join(import.meta.dirname, "..", "templates", "invoices");
const PARTIALS_DIR = join(TEMPLATES_DIR, "partials");
const CSS_PATH = join(TEMPLATES_DIR, "invoice.css");

// ---------------------------------------------------------------------------
// Internal: stavke annotation
// ---------------------------------------------------------------------------

type AnnotatedStavka =
  | (StavkaUslugaV2Parsed & { subtotal: RacunV2Subtotal })
  | (StavkaProizvodV2Parsed & { subtotal: RacunV2Subtotal });

/**
 * Pairs each raw stavka with its computed subtotal by array index.
 * `calcInvoiceTotals` preserves stavka order, so positional zip is safe.
 * Done internally so callers pass the schema shape, not a pre-zipped one.
 */
const annotateStavke = (
  stavke: StavkaRacunaV2Parsed[],
  totals: RacunV2InvoiceTotals,
): AnnotatedStavka[] => {
  return stavke.map((stavka, idx) => {
    const subtotal = totals.stavkaSubtotali[idx];
    if (!subtotal) {
      throw new Error(
        `predracun.template: stavka at index ${idx} has no matching subtotal in totals.stavkaSubtotali (length ${totals.stavkaSubtotali.length}). Stavke and totals are out of sync.`,
      );
    }
    // The discriminated union resolves correctly because we copy `tipStavke`
    // verbatim from the original stavka.
    return { ...stavka, subtotal } as AnnotatedStavka;
  });
};

// ---------------------------------------------------------------------------
// Internal: number / date / pct formatters
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

const formatQuantity = (value: unknown): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "0";
  return quantityFormatter.format(num);
};

const formatMoney = (value: unknown): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "0,00";
  return moneyFormatter.format(num);
};

const formatMoneyRsd = (value: unknown): string => `${formatMoney(value)} RSD`;

const formatPercent = (value: unknown): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return `${quantityFormatter.format(num)}%`;
};

const formatDate = (value: unknown): string => {
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
// Internal: domain helpers
// ---------------------------------------------------------------------------

const cenaPoJedinici = (stavka: unknown): string => {
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

const pdvLabel = (pdvPoStopama: unknown): string => {
  if (!pdvPoStopama || typeof pdvPoStopama !== "object") return "PDV";
  const keys = Object.keys(pdvPoStopama as Record<string, unknown>);
  if (keys.length === 1) {
    return `PDV (${keys[0]}%)`;
  }
  // Mixed rates — drop the percent so the displayed label doesn't mislead.
  return "PDV";
};

const buildPlaceholderQrUrl = (data: PredracunTemplateData): string => {
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

const qrSrc = (data: PredracunTemplateData): string => {
  if (data.qrCodeDataUrl) return data.qrCodeDataUrl;
  return buildPlaceholderQrUrl(data);
};

// ---------------------------------------------------------------------------
// Internal: lazy compile
// ---------------------------------------------------------------------------

type CompiledTemplate = (
  data: PredracunTemplateData & { cssTag: string },
) => string;

let cachedTemplate: CompiledTemplate | null = null;
let cachedCss: string | null = null;

const getCompiledTemplate = (): CompiledTemplate => {
  if (cachedTemplate) return cachedTemplate;

  // Private Handlebars instance — keeps helpers/partials scoped to this
  // renderer so the konacni/avansni templates (when they land) can register
  // their own without colliding.
  const hbs = Handlebars.create();

  hbs.registerHelper("eq", (a: unknown, b: unknown) => a === b);
  hbs.registerHelper("formatQuantity", formatQuantity);
  hbs.registerHelper("formatMoney", formatMoney);
  hbs.registerHelper("formatMoneyRsd", formatMoneyRsd);
  hbs.registerHelper("formatPercent", formatPercent);
  hbs.registerHelper("formatDate", formatDate);
  hbs.registerHelper("cenaPoJedinici", cenaPoJedinici);
  hbs.registerHelper("pdvLabel", pdvLabel);
  hbs.registerHelper("qrSrc", qrSrc);

  hbs.registerPartial(
    "stavka-usluga",
    readFileSync(join(PARTIALS_DIR, "stavka-usluga.hbs"), "utf8"),
  );
  hbs.registerPartial(
    "stavka-proizvod",
    readFileSync(join(PARTIALS_DIR, "stavka-proizvod.hbs"), "utf8"),
  );

  const source = readFileSync(join(TEMPLATES_DIR, "predracun.hbs"), "utf8");
  cachedTemplate = hbs.compile(source) as CompiledTemplate;
  return cachedTemplate;
};

const getInlineCss = (): string => {
  if (cachedCss === null) {
    cachedCss = readFileSync(CSS_PATH, "utf8");
  }
  return cachedCss;
};

const buildCssTag = (opts: RenderOptions): string => {
  const css = opts.css ?? "inline";
  if (css === "inline") {
    return `<style>${getInlineCss()}</style>`;
  }
  const href = opts.cssHref ?? "./invoice.css";
  return `<link rel="stylesheet" href="${href}" />`;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const renderPredracun = (
  data: PredracunTemplateData,
  opts: RenderOptions = {},
): string => {
  const template = getCompiledTemplate();
  const stavke = annotateStavke(data.stavke, data.totals);
  const cssTag = buildCssTag(opts);

  return template({
    ...data,
    stavke: stavke as unknown as StavkaRacunaV2Parsed[],
    cssTag,
  });
};
