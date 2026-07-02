import { formatDate } from "date-fns";
import { srLatn } from "date-fns/locale";
import type {
  PrijavaZodType,
  SertifikatTemplateKeyType,
  SertifikatType,
} from "ied-shared";

type BuildSertifikatOptions = {
  brojSertifikata: number;
  seminarDates: Date[];
  seminarName: string;
  templateKey: SertifikatTemplateKeyType;
};

const formatDay = (date: Date) => formatDate(date, "d", { locale: srLatn });
const formatMonth = (date: Date) =>
  formatDate(date, "MMMM", { locale: srLatn });
const formatYear = (date: Date) => formatDate(date, "yyyy", { locale: srLatn });

// Serbian list join: ["a", "b", "c"] -> "a, b i c".
const joinSerbian = (parts: string[]): string =>
  parts.length <= 1
    ? (parts[0] ?? "")
    : `${parts.slice(0, -1).join(", ")} i ${parts[parts.length - 1]}`;

// Consolidates seminar dates into a grammatically correct Serbian string:
// - same month:  "1, 2 i 3 jun 2026"
// - same year:   "31 januar i 1 februar 2026"
// - diff years:  "31 decembar 2026 i 1 januar 2027"
// Dates may arrive as Date objects or ISO strings (API data isn't always
// coerced), so normalize to Date before doing any date math.
export const formatSeminarDates = (dates: (Date | string)[]): string => {
  const sorted = dates
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());
  const first = sorted[0];
  if (!first) return "";

  const sameYear = sorted.every((d) => d.getFullYear() === first.getFullYear());
  const sameMonth =
    sameYear && sorted.every((d) => d.getMonth() === first.getMonth());

  if (sameMonth) {
    return `${joinSerbian(sorted.map(formatDay))} ${formatMonth(first)} ${formatYear(first)}`;
  }
  if (sameYear) {
    return `${joinSerbian(sorted.map((d) => `${formatDay(d)} ${formatMonth(d)}`))} ${formatYear(first)}`;
  }
  return joinSerbian(
    sorted.map((d) => `${formatDay(d)} ${formatMonth(d)} ${formatYear(d)}`),
  );
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
      datumi_seminara: formatSeminarDates(options.seminarDates),
      godina_seminara: formatYear(
        options.seminarDates[0] ? new Date(options.seminarDates[0]) : new Date(),
      ),
      templateKey: options.templateKey,
    } satisfies SertifikatType,
  };
};

export const buildBatchSertifikati = (
  prijave: PrijavaZodType[],
  startingNumber: number,
  seminarName: string,
  seminarDates: Date[],
  templateKey: SertifikatTemplateKeyType,
) => {
  return prijave.reduce(
    (acc, prijava) => {
      const { warning, sertifikat } = buildSingleSertifikat(prijava, {
        brojSertifikata: startingNumber + acc.sertifikati.length,
        seminarDates,
        seminarName,
        templateKey,
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
