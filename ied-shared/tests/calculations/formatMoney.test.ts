import { describe, expect, it } from "vitest";
import { formatMoney } from "../../src/calculations/racuniV2/formatMoney";

describe("racuniV2 formatMoney — basic formatting", () => {
  it.each([
    [0, "RSD", "0,00 RSD"],
    [1, "RSD", "1,00 RSD"],
    [1234.5, "RSD", "1.234,50 RSD"],
    [1234567.89, "RSD", "1.234.567,89 RSD"],
    [0, "EUR", "0,00 EUR"],
    [99.9, "EUR", "99,90 EUR"],
    [1234.5, "EUR", "1.234,50 EUR"],
  ] as const)("formatMoney(%s, %s) → %s", (amount, valuta, expected) => {
    expect(formatMoney(amount, valuta)).toBe(expected);
  });
});

describe("racuniV2 formatMoney — currency suffix is inert in Phase 1", () => {
  it("keeps the same number formatting for RSD and EUR — only the suffix differs", () => {
    expect(formatMoney(1234.5, "RSD")).toBe("1.234,50 RSD");
    expect(formatMoney(1234.5, "EUR")).toBe("1.234,50 EUR");
  });
});

describe("racuniV2 formatMoney — negatives", () => {
  it("renders negative amounts with a leading minus", () => {
    expect(formatMoney(-100, "RSD")).toBe("-100,00 RSD");
    expect(formatMoney(-1234.5, "EUR")).toBe("-1.234,50 EUR");
  });
});

describe("racuniV2 formatMoney — non-finite defensive fallback", () => {
  it.each([
    [Number.NaN, "RSD", "0,00 RSD"],
    [Number.POSITIVE_INFINITY, "EUR", "0,00 EUR"],
    [Number.NEGATIVE_INFINITY, "RSD", "0,00 RSD"],
  ] as const)(
    "non-finite %s collapses to 0,00 (no NaN bleed-through)",
    (amount, valuta, expected) => {
      expect(formatMoney(amount, valuta)).toBe(expected);
    },
  );
});

describe("racuniV2 formatMoney — fractional rounding (Intl banker's rounding)", () => {
  // formatMoney does not pre-round — the calculators feed it
  // already-rounded values. These tests document Intl's display rounding so
  // future-us can spot drift if the locale changes.
  it("rounds .5 boundary using Intl behavior", () => {
    expect(formatMoney(1.005, "RSD")).toBe("1,01 RSD");
    expect(formatMoney(999.999, "RSD")).toBe("1.000,00 RSD");
  });
});
