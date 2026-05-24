/**
 * Preview script for the Predračun Handlebars template.
 *
 * Renders three sample view models that mirror the existing
 * `predracun_*_demo.html` files and writes the output to
 * `src/templates/invoices/preview/`. Use `pnpm preview:predracun` and open
 * the generated HTML in a browser to visually compare against the demos.
 *
 * The samples compute their `totals` live via `calcInvoiceTotals` so this
 * also serves as an end-to-end smoke test for the calculator → renderer
 * pipeline.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  calcInvoiceTotals,
  type StavkaProizvodV2Parsed,
  type StavkaUslugaV2Parsed,
  TipRacuna,
} from "ied-shared";
import {
  type IzdavacProfile,
  type PredracunTemplateData,
  type PrimalacView,
  renderPredracun,
  type UplataView,
} from "../templates/predracun.template";

// ---------------------------------------------------------------------------
// Shared sample fragments (same issuer/recipient/payment across all demos)
// ---------------------------------------------------------------------------

const izdavac: IzdavacProfile = {
  naziv: "Balkanski savet za održivi razvoj i edukaciju",
  adresa: "Bežanijska 30, 11080 Zemun",
  telefoni: ["011/655-83-05", "064/821-33-22"],
  pib: "108935581",
  maticniBroj: "28170866",
};

const primalac: PrimalacView = {
  tipPrimaoca: "firma",
  naziv: "Zdravstveni centar Surdulica",
  adresa: "Srpskih vladara 111, Surdulica",
  pib: "100948335",
  maticniBroj: "17191918",
};

const uplata: UplataView = {
  tekuciRacun: "325-9500600050635-47",
  banka: "OTP banka",
};

// 13.05.2026 fixed across all demos so previews are reproducible.
const datum = new Date(Date.UTC(2026, 4, 13));

// ---------------------------------------------------------------------------
// Stavka builders — keep the parsed-schema shape explicit so any future
// drift between schema and demos surfaces as a TS error here.
// ---------------------------------------------------------------------------

const uslugaEbolovanje = (
  onlineKolicina: number,
  offlineKolicina: number,
  popust: number,
): StavkaUslugaV2Parsed => ({
  tipStavke: "usluga",
  naziv:
    "Kotizacija za obuku: eBolovanje – poslodavac · Operativni rad i zakonske obaveze",
  datum,
  jedinicaMere: "broj učesnika",
  onlineKolicina,
  onlineCena: 21500,
  offlineKolicina,
  offlineCena: 21500,
  popust,
  stopaPdv: 20,
});

const uslugaGdpr: StavkaUslugaV2Parsed = {
  tipStavke: "usluga",
  naziv:
    "Kotizacija za obuku: GDPR i zaštita podataka u praksi za HR menadžere",
  datum,
  jedinicaMere: "broj učesnika",
  onlineKolicina: 4,
  onlineCena: 18500,
  offlineKolicina: 1,
  offlineCena: 18500,
  popust: 10,
  stopaPdv: 20,
};

const uslugaBezbednost: StavkaUslugaV2Parsed = {
  tipStavke: "usluga",
  naziv:
    "Kotizacija za obuku: Bezbednost i zdravlje na radu — novi propisi 2026",
  datum,
  jedinicaMere: "broj učesnika",
  onlineKolicina: 2,
  onlineCena: 19000,
  offlineKolicina: 3,
  offlineCena: 19000,
  popust: 0,
  stopaPdv: 20,
};

const proizvodPrirucnik: StavkaProizvodV2Parsed = {
  tipStavke: "proizvod",
  naziv: "Priručnik: eBolovanje za poslodavce — praktični vodič (knjiga)",
  jedinicaMere: "komad",
  kolicina: 5,
  cena: 1800,
  popust: 0,
  stopaPdv: 10,
};

// ---------------------------------------------------------------------------
// View-model builder
// ---------------------------------------------------------------------------

type SampleStavke =
  | StavkaUslugaV2Parsed[]
  | StavkaProizvodV2Parsed[]
  | (StavkaUslugaV2Parsed | StavkaProizvodV2Parsed)[];

const buildSample = (stavke: SampleStavke): PredracunTemplateData => {
  const totals = calcInvoiceTotals(
    stavke,
    { pdvObveznik: true },
    TipRacuna.PREDRACUN,
  );

  return {
    pozivNaBroj: "26030083",
    datum,
    mesto: "Beograd",
    rokZaUplatu: 10,
    valuta: "RSD",
    pdvObveznik: true,
    izdavac,
    primalac,
    uplata,
    stavke,
    totals,
  };
};

// ---------------------------------------------------------------------------
// Sample datasets matching the existing demo HTMLs
// ---------------------------------------------------------------------------

const samples: Record<string, PredracunTemplateData> = {
  "1_usluga": buildSample([uslugaEbolovanje(1, 0, 5)]),
  "3_usluge": buildSample([
    uslugaEbolovanje(3, 2, 5),
    uslugaGdpr,
    uslugaBezbednost,
  ]),
  proizvod_usluga: buildSample([uslugaEbolovanje(2, 3, 5), proizvodPrirucnik]),
};

// ---------------------------------------------------------------------------
// Render & write
// ---------------------------------------------------------------------------

const outDir = join(
  import.meta.dirname,
  "..",
  "templates",
  "invoices",
  "preview",
);
mkdirSync(outDir, { recursive: true });

for (const [name, data] of Object.entries(samples)) {
  // `link` mode lets you iterate on invoice.css without re-running the
  // script. `../invoice.css` because preview HTMLs sit one level deeper
  // than the stylesheet.
  const html = renderPredracun(data, {
    css: "link",
    cssHref: "../invoice.css",
  });
  const outPath = join(outDir, `predracun_${name}.html`);
  writeFileSync(outPath, html, "utf8");
  console.log(`✓ Wrote ${outPath}`);
}
