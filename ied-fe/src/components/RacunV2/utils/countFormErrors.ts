import type { FieldErrors, FieldValues } from "react-hook-form";

/**
 * Counts leaf validation errors in an RHF `formState.errors` tree.
 *
 * Why recursive: top-level `Object.keys(errors).length` undercounts nested
 * errors. A discriminated-union subtree like `primalacRacuna` with two
 * invalid fields shows up as `{ primalacRacuna: { naziv: {...}, pib: {...} } }`
 * — that's 2 errors, not 1. Same story for `stavke[i].naziv` once Epic 5
 * lands.
 *
 * Leaf detection: RHF `FieldError` always has a `type` field (string|number).
 * Any object with `type` of those types is treated as a leaf and counted as
 * one error. Anything else is recursed into.
 *
 * Defensive against `null` / non-object values that shouldn't appear in
 * RHF's tree but cost nothing to handle.
 */
export const countFormErrors = <TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues> | undefined,
): number => countLeaves(errors);

const countLeaves = (node: unknown): number => {
  if (!node || typeof node !== "object") {
    return 0;
  }

  const maybeType = (node as { type?: unknown }).type;
  if (typeof maybeType === "string" || typeof maybeType === "number") {
    return 1;
  }

  let total = 0;
  for (const value of Object.values(node)) {
    total += countLeaves(value);
  }
  return total;
};
