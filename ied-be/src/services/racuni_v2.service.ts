import {
  calcInvoiceTotals,
  isIzdavacPdvObveznik,
  type RacunV2Parsed,
} from "ied-shared";
import { izdavacRacuna } from "../constants/izdavacRacuna.const";
import {
  type IzdavacProfile,
  type PredracunTemplateData,
  type PrimalacView,
  renderPredracun,
} from "../templates/predracun.template";
import { sanitizeFilename } from "../utils/docx.utils";
import { env } from "../utils/envVariables";
import { renderHtmlToPdfBuffer } from "./docx.service";

type PredracunV2Parsed = Extract<
  RacunV2Parsed,
  { tipRacuna: "predracun" }
>;

type IzdavacConfig = (typeof izdavacRacuna)[number];

export const generatePredracunV2Pdf = async (
  racunData: PredracunV2Parsed,
): Promise<{ buffer: Buffer; fileName: string }> => {
  const viewModel = buildPredracunTemplateData(racunData);
  const html = renderPredracun(viewModel, { css: "inline" });
  const buffer = await renderHtmlToPdfBuffer(html, {
    format: "A4",
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  return {
    buffer,
    fileName: getPredracunFileName(racunData),
  };
};

const buildPredracunTemplateData = (
  racunData: PredracunV2Parsed,
): PredracunTemplateData => {
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
    rokZaUplatu: racunData.rokZaUplatu,
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

const buildIzdavacProfile = (
  racunData: PredracunV2Parsed,
): IzdavacProfile => {
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

const buildPrimalacView = (racunData: PredracunV2Parsed): PrimalacView => {
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
): PredracunTemplateData["uplata"] => {
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

const getPredracunFileName = (racunData: PredracunV2Parsed): string => {
  const primalac = racunData.primalacRacuna;
  const primalacNaziv =
    primalac.tipPrimaoca === "firma" ? primalac.naziv : primalac.imeIPrezime;

  return sanitizeFilename(`${racunData.pozivNaBroj}_${primalacNaziv}.pdf`);
};
