import {
  calcInvoiceTotals,
  isIzdavacPdvObveznik,
  type RacunV2Parsed,
  TipRacuna,
} from "ied-shared";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import {
  type InvoiceTemplateData,
  type InvoiceTemplateName,
  type IzdavacProfile,
  type PrimalacView,
  renderInvoice,
} from "../templates/invoiceRenderer";
import { sanitizeFilename } from "../utils/docx.utils";
import { env } from "../utils/envVariables";
import { renderHtmlToPdfBuffer } from "./docx.service";

type IzdavacConfig = (typeof izdavacRacuna)[number];

/**
 * Maps each supported `tipRacuna` to the Handlebars template it renders.
 * Add an entry when a new invoice variant ships (konacni, racun); the rest
 * of the pipeline (view-model builder, file-name, PDF render) is shared.
 *
 * `Partial<Record<…>>` because unsupported variants throw upstream — both
 * the route's allow-list and {@link pickTemplateName}'s explicit check.
 */
const TEMPLATE_NAME_BY_TIP_RACUNA: Partial<
  Record<TipRacuna, InvoiceTemplateName>
> = {
  [TipRacuna.PREDRACUN]: "predracun",
  [TipRacuna.AVANSNI_RACUN]: "avansni",
};

export const generateRacunV2Pdf = async (
  racunData: RacunV2Parsed,
): Promise<{ buffer: Buffer; fileName: string }> => {
  const templateName = pickTemplateName(racunData.tipRacuna);
  const viewModel = buildInvoiceTemplateData(racunData);
  const html = renderInvoice(templateName, viewModel, { css: "inline" });
  const buffer = await renderHtmlToPdfBuffer(html, {
    format: "A4",
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  return {
    buffer,
    fileName: getInvoiceFileName(racunData),
  };
};

const pickTemplateName = (tipRacuna: TipRacuna): InvoiceTemplateName => {
  const name = TEMPLATE_NAME_BY_TIP_RACUNA[tipRacuna];
  if (!name) {
    // Defense-in-depth: the route's allow-list already rejects unsupported
    // variants with a 400. This throw turns a programmer mistake (forgetting
    // to update the map when a new tip lands) into a 500 with a clear
    // message instead of a confusing Handlebars "file not found".
    throw new Error(
      `Racun V2 PDF generation not supported for tipRacuna: ${tipRacuna}`,
    );
  }
  return name;
};

/**
 * Shared view-model builder for every invoice variant. Most fields are
 * identical across `RacunV2Parsed` branches; the only branch-specific bits
 * are the two mutually exclusive payment-date fields (`rokZaUplatu` on
 * predracun/konacni/racun, `datumUplateAvansa` on avansni). The template
 * ignores whichever is absent.
 */
const buildInvoiceTemplateData = (
  racunData: RacunV2Parsed,
): InvoiceTemplateData => {
  const pdvObveznik = isIzdavacPdvObveznik(racunData.izdavacRacuna);
  const totals = calcInvoiceTotals(
    racunData.stavke,
    { pdvObveznik },
    racunData.tipRacuna,
  );

  return {
    pozivNaBroj: racunData.pozivNaBroj,
    datum: new Date(),
    mesto: "Beograd",
    rokZaUplatu:
      "rokZaUplatu" in racunData ? racunData.rokZaUplatu : undefined,
    datumUplateAvansa:
      racunData.tipRacuna === TipRacuna.AVANSNI_RACUN
        ? racunData.datumUplateAvansa
        : undefined,
    valuta: racunData.valuta,
    pdvObveznik,
    izdavac: buildIzdavacProfile(racunData),
    primalac: buildPrimalacView(racunData),
    uplata: parseTekuciRacun(racunData.tekuciRacun),
    stavke: racunData.stavke,
    totals,
    showQrCode: env.features.racuniV2QrCode,
  };
};

const buildIzdavacProfile = (racunData: RacunV2Parsed): IzdavacProfile => {
  const issuer = izdavacRacuna.find(
    (item) => item.id === racunData.izdavacRacuna,
  );
  if (!issuer) {
    throw new Error(`Unknown izdavac racuna: ${racunData.izdavacRacuna}`);
  }

  const { naziv, adresa } = splitIzdavacNaziv(issuer.naziv);

  return {
    naziv,
    adresa,
    telefoni: issuer.kontaktTelefoni,
    pib: String(issuer.pib),
    maticniBroj: String(issuer.maticniBroj),
  };
};

const splitIzdavacNaziv = (
  fullNaziv: IzdavacConfig["naziv"],
): Pick<IzdavacProfile, "naziv" | "adresa"> => {
  const [naziv = fullNaziv, ...addressParts] = fullNaziv.split(",");
  return {
    naziv: naziv.trim(),
    adresa: addressParts.join(",").trim(),
  };
};

const buildPrimalacView = (racunData: RacunV2Parsed): PrimalacView => {
  const primalac = racunData.primalacRacuna;
  const adresa = joinAddress(primalac.adresa, primalac.mesto);

  if (primalac.tipPrimaoca === "firma") {
    return {
      tipPrimaoca: "firma",
      naziv: primalac.naziv,
      adresa,
      pib: primalac.pib,
      maticniBroj: primalac.maticniBroj,
    };
  }

  return {
    tipPrimaoca: "fizicko",
    imeIPrezime: primalac.imeIPrezime,
    adresa,
    jmbg: primalac.jmbg,
  };
};

const joinAddress = (...parts: Array<string | undefined>): string => {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
};

const parseTekuciRacun = (
  tekuciRacun: string,
): InvoiceTemplateData["uplata"] => {
  const match = tekuciRacun.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (!match) {
    return {
      tekuciRacun,
      banka: "",
    };
  }

  const [, account, bank] = match;
  if (!account || !bank) {
    return {
      tekuciRacun,
      banka: "",
    };
  }

  return {
    tekuciRacun: account.trim(),
    banka: bank.trim(),
  };
};

const getInvoiceFileName = (racunData: RacunV2Parsed): string => {
  const primalac = racunData.primalacRacuna;
  const primalacNaziv =
    primalac.tipPrimaoca === "firma" ? primalac.naziv : primalac.imeIPrezime;

  return sanitizeFilename(`${racunData.pozivNaBroj}_${primalacNaziv}.pdf`);
};
