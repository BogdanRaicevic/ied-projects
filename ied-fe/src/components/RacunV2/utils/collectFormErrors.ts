import type { FieldErrors, FieldValues } from "react-hook-form";

export type CollectedFormError = {
  /** Path to the failing field, segment by segment (e.g. ["stavke", "0", "naziv"]). */
  path: string[];
  /** Human-readable message from the validator (Zod). May be empty. */
  message: string;
};

/**
 * Walks RHF's `formState.errors` tree and returns a flat list of leaf errors.
 *
 * Sibling to `countFormErrors` — same leaf-detection rule (any object with a
 * string|number `type` is one `FieldError`), but instead of incrementing a
 * counter we record `{ path, message }`. Path is the segment chain from the
 * form root to the leaf, suitable for `formatErrorPath` rendering.
 *
 * Discriminated-union schema-level errors land at `errors.<field>.root`. We
 * keep the "root" segment in the path so callers can detect / strip it; the
 * default `formatErrorPath` drops it for display.
 */
export const collectFormErrors = <TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues> | undefined,
): CollectedFormError[] => {
  const acc: CollectedFormError[] = [];
  walk(errors, [], acc);
  return acc;
};

const walk = (
  node: unknown,
  path: string[],
  acc: CollectedFormError[],
): void => {
  if (!node || typeof node !== "object") {
    return;
  }

  const maybeType = (node as { type?: unknown }).type;
  if (typeof maybeType === "string" || typeof maybeType === "number") {
    const message = (node as { message?: unknown }).message;
    acc.push({
      path,
      message: typeof message === "string" ? message : "",
    });
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    walk(value, [...path, key], acc);
  }
};

/**
 * Friendly Serbian label per known path segment. Anything not in the map
 * falls through as-is, so unknown future fields are still legible (just not
 * polished).
 */
const SEGMENT_LABELS: Record<string, string> = {
  primalacRacuna: "Primalac",
  izdavacRacuna: "Izdavač",
  tipRacuna: "Tip računa",
  valuta: "Valuta",
  stavke: "Stavke",
  placeno: "Plaćeno",
  avansBezPdv: "Avans bez PDV-a",
  stopaPdvAvansni: "Stopa PDV-a (avans)",
  defaultStopaPdv: "Podrazumevana stopa PDV-a",
  naziv: "Naziv",
  imeIPrezime: "Ime i prezime",
  pib: "PIB",
  maticniBroj: "Matični broj",
  firma_id: "Firma",
  jmbg: "JMBG",
  adresa: "Adresa",
  mesto: "Mesto",
  datum: "Datum",
  lokacija: "Lokacija",
  jedinicaMere: "Jedinica mere",
  onlineKolicina: "Broj učesnika (online)",
  onlineCena: "Cena (online)",
  offlineKolicina: "Broj učesnika (offline)",
  offlineCena: "Cena (offline)",
  kolicina: "Količina",
  cena: "Cena",
  popust: "Popust",
  stopaPdv: "Stopa PDV-a",
};

/**
 * Renders an error path for display:
 * - Numeric segments are 1-indexed (`stavke.0` → "Stavka 1") so the label
 *   matches the card header users see in the form.
 * - Known segments use the Serbian map above; unknown segments pass through.
 * - Trailing "root" segments (RHF discriminated-union schema errors) are
 *   dropped — the parent label alone is enough context.
 */
export const formatErrorPath = (path: string[]): string => {
  const trimmed = path[path.length - 1] === "root" ? path.slice(0, -1) : path;

  const parts: string[] = [];
  for (const segment of trimmed) {
    if (/^\d+$/.test(segment)) {
      // Numeric index: combine with the previous label as "<Label> <n+1>".
      const oneBased = Number(segment) + 1;
      const previous = parts.pop() ?? "";
      const singular = previous.endsWith("e")
        ? `${previous.slice(0, -1)}a` // "Stavke" → "Stavka"
        : previous;
      parts.push(`${singular} ${oneBased}`);
      continue;
    }
    parts.push(SEGMENT_LABELS[segment] ?? segment);
  }

  return parts.join(" · ");
};
