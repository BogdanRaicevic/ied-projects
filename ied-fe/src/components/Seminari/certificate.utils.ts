import { formatDate } from "date-fns";
import { srLatn } from "date-fns/locale";
import type { PrijavaZodType, SertifikatType } from "ied-shared";

type BuildSertifikatOptions = {
  brojSertifikata: number;
  seminarDate: Date;
  seminarName: string;
};

export const getCurrentYearLastTwoDigits = () => {
  return String(new Date().getFullYear()).slice(-2);
};

export const getPrijavaFullName = (prijava: PrijavaZodType) => {
  return `${prijava.zaposleni_ime || ""} ${prijava.zaposleni_prezime || ""}`.trim();
};

export const getCertificateWarning = (prijava: PrijavaZodType) => {
  const fullName = getPrijavaFullName(prijava);
  const nameParts = fullName.split(" ").filter(Boolean);

  if (nameParts.length <= 1) {
    return `Ime i prezime nisu validni za firmu: ${prijava.firma_naziv || "Nepoznata firma"}`;
  }

  if (!prijava.firma_naziv?.trim()) {
    return `Naziv firme nije validan za korisnika: ${fullName || "Nepoznat korisnik"}`;
  }

  return null;
};

export const buildSingleSertifikat = (
  prijava: PrijavaZodType,
  options: BuildSertifikatOptions,
) => {
  const warning = getCertificateWarning(prijava);

  if (warning) {
    return { warning, sertifikat: null };
  }

  return {
    warning: null,
    sertifikat: {
      broj_sertifikata: options.brojSertifikata,
      firma_naziv: prijava.firma_naziv.trim(),
      ime_prezime: getPrijavaFullName(prijava),
      seminar_naziv: options.seminarName,
      datum_seminara: formatDate(options.seminarDate, "dd. MMMM yyyy.", {
        locale: srLatn,
      }),
      godina_seminara: formatDate(options.seminarDate, "yyyy", {
        locale: srLatn,
      }),
      godina_sertifikata: getCurrentYearLastTwoDigits(),
    } satisfies SertifikatType,
  };
};

export const buildBatchSertifikati = (
  prijave: PrijavaZodType[],
  startingNumber: number,
  seminarName: string,
  seminarDate: Date,
) => {
  return prijave.reduce(
    (acc, prijava) => {
      const { warning, sertifikat } = buildSingleSertifikat(prijava, {
        brojSertifikata: startingNumber + acc.sertifikati.length,
        seminarDate,
        seminarName,
      });

      if (warning) {
        acc.warnings.push(warning);
        return acc;
      }

      if (sertifikat) {
        acc.sertifikati.push(sertifikat);
      }

      return acc;
    },
    {
      warnings: [] as string[],
      sertifikati: [] as SertifikatType[],
    },
  );
};
