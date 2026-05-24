/**
 * Renders an invoice HTML document from a typed view model. Owns the
 * Handlebars wiring (helper + partial registration, template compilation)
 * and the view-model contract; the helper functions themselves live in
 * `./invoiceHelpers` and have no Handlebars dependency.
 *
 * The view model is intentionally distinct from the raw `RacunV2Parsed` Zod
 * shape: it carries derived fields the schema doesn't (full issuer profile,
 * bank name, computed totals) so the template can stay logic-light.
 * `racuni_v2.service.ts` builds the view model from persisted data; the
 * preview script hand-builds it for sample renders.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import Handlebars from "handlebars";
import type {
  RacunV2InvoiceTotals,
  RacunV2Subtotal,
  StavkaProizvodV2Parsed,
  StavkaRacunaV2Parsed,
  StavkaUslugaV2Parsed,
} from "ied-shared";
import {
  cenaPoJedinici,
  formatDate,
  formatMoney,
  formatMoneyRsd,
  formatPercent,
  formatQuantity,
  pdvLabel,
  qrSrc,
} from "./invoiceHelpers";

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

/**
 * View model shared by every invoice template (predracun, avansni, …).
 * Branch-specific fields are optional: the predracun template ignores
 * `datumUplateAvansa`; the avansni template ignores `rokZaUplatu`. Keeping
 * one type means the helper/partial set is shared and Handlebars data
 * binding doesn't need a type-per-template ceremony.
 */
export type InvoiceTemplateData = {
  pozivNaBroj: string;
  datum: Date | string;
  mesto: string;
  /** Predracun, konacni, racun only. */
  rokZaUplatu?: number | null;
  /** Avansni only — date the avans was actually paid. */
  datumUplateAvansa?: Date | string | null;
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

/**
 * Public surface lists every `.hbs` file under `templates/invoices/` that the
 * renderer knows how to compile. Add a new entry here when wiring a new
 * invoice variant (konacni, racun, …); the rest of the renderer is template-
 * agnostic.
 */
export type InvoiceTemplateName = "predracun" | "avansni";

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
 *
 * `stopaPdv` is overridden with the calculator-resolved rate so the displayed
 * column always matches `subtotal.pdv` in the same row. The calculator forces
 * `stopaPdv` to 0 when the issuer is not a PDV obveznik even if the user
 * typed e.g. 20; if we displayed the raw stavka value the percent shown
 * wouldn't add up against the iznos PDV-a alongside it.
 */
const annotateStavke = (
  stavke: StavkaRacunaV2Parsed[],
  totals: RacunV2InvoiceTotals,
): AnnotatedStavka[] => {
  return stavke.map((stavka, idx) => {
    const subtotal = totals.stavkaSubtotali[idx];
    if (!subtotal) {
      throw new Error(
        `invoiceRenderer: stavka at index ${idx} has no matching subtotal in totals.stavkaSubtotali (length ${totals.stavkaSubtotali.length}). Stavke and totals are out of sync.`,
      );
    }
    // The discriminated union resolves correctly because we copy `tipStavke`
    // verbatim from the original stavka.
    return {
      ...stavka,
      stopaPdv: subtotal.stopaPdv,
      subtotal,
    } as AnnotatedStavka;
  });
};

// ---------------------------------------------------------------------------
// Handlebars setup
// ---------------------------------------------------------------------------

// Helpers + partials are registered on the default Handlebars singleton at
// module load. Side-effect-on-import is the idiomatic templating-engine
// pattern and we're the only Handlebars consumer in this codebase, so no
// collision risk. No per-render caching of compiled templates: interactive
// PDF generation hits this path infrequently and Puppeteer (~500-2000 ms)
// dwarfs the few ms spent re-reading + re-compiling .hbs source per render.
// If batch generation (many invoices per process) ever lands, reintroduce a
// compiled-template cache keyed by `InvoiceTemplateName`.

Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper("formatQuantity", formatQuantity);
Handlebars.registerHelper("formatMoney", formatMoney);
Handlebars.registerHelper("formatMoneyRsd", formatMoneyRsd);
Handlebars.registerHelper("formatPercent", formatPercent);
Handlebars.registerHelper("formatDate", formatDate);
Handlebars.registerHelper("cenaPoJedinici", cenaPoJedinici);
Handlebars.registerHelper("pdvLabel", pdvLabel);
Handlebars.registerHelper("qrSrc", qrSrc);

Handlebars.registerPartial(
  "stavka-usluga",
  readFileSync(join(PARTIALS_DIR, "stavka-usluga.hbs"), "utf8"),
);
Handlebars.registerPartial(
  "stavka-proizvod",
  readFileSync(join(PARTIALS_DIR, "stavka-proizvod.hbs"), "utf8"),
);

const buildCssTag = (opts: RenderOptions): string => {
  const css = opts.css ?? "inline";
  if (css === "inline") {
    return `<style>${readFileSync(CSS_PATH, "utf8")}</style>`;
  }
  const href = opts.cssHref ?? "./invoice.css";
  return `<link rel="stylesheet" href="${href}" />`;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renders an invoice HTML document using the named template. Callers pick
 * the template (`"predracun"` / `"avansni"` / …); the renderer itself stays
 * template-agnostic.
 */
export const renderInvoice = (
  name: InvoiceTemplateName,
  data: InvoiceTemplateData,
  opts: RenderOptions = {},
): string => {
  const source = readFileSync(join(TEMPLATES_DIR, `${name}.hbs`), "utf8");
  const template = Handlebars.compile(source);
  const stavke = annotateStavke(data.stavke, data.totals);
  const cssTag = buildCssTag(opts);

  return template({
    ...data,
    stavke: stavke as unknown as StavkaRacunaV2Parsed[],
    cssTag,
  });
};
