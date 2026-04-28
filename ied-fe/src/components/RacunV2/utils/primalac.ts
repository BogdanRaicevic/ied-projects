import type { PrimalacRacunaV2Form } from "ied-shared";

type TipPrimaoca = PrimalacRacunaV2Form["tipPrimaoca"];

/**
 * Builds a fresh primalac subtree for the target tip. All user-editable fields
 * are reset to empty strings; switching tip is treated as "start over". Per
 * the schema, the firma branch and the fizicko branch share zero user fields
 * by name (`naziv` vs `imeIPrezime`, `pib`/`maticniBroj`/`firma_id` vs
 * `jmbg`), so there is nothing to carry over even if we wanted to.
 */
export const buildEmptyPrimalac = (
  nextTip: TipPrimaoca,
): PrimalacRacunaV2Form => {
  if (nextTip === "firma") {
    return {
      tipPrimaoca: "firma",
      firma_id: "",
      naziv: "",
      pib: "",
      maticniBroj: "",
      adresa: "",
      mesto: "",
    };
  }

  return {
    tipPrimaoca: "fizicko",
    imeIPrezime: "",
    adresa: "",
    mesto: "",
    jmbg: "",
  };
};

/**
 * Value-based check: does the user have any non-empty primalac field right
 * now? Used to decide whether switching tip needs a confirm dialog.
 *
 * Intentionally not based on RHF's `dirtyFields`: when we replace the
 * `primalacRacuna` subtree across a discriminated union, RHF computes per-key
 * dirty against the old branch's defaults (which have different keys), so
 * keys exclusive to the new branch end up dirty=true even when empty.
 * Value-based check is immune to that and is what we actually mean to ask.
 */
export const hasPrimalacContent = (
  current: PrimalacRacunaV2Form,
): boolean => {
  return Object.entries(current).some(
    ([key, value]) =>
      key !== "tipPrimaoca" &&
      typeof value === "string" &&
      value.trim() !== "",
  );
};
