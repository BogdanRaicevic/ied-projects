import { describe, expect, it } from "vitest";
import { escapeRegex } from "../../src/utils/utils";

describe("escapeRegex", () => {
  it("leaves plain alphanumeric input untouched", () => {
    expect(escapeRegex("Firma123")).toBe("Firma123");
  });

  it.each([
    [".", "\\."],
    ["*", "\\*"],
    ["+", "\\+"],
    ["?", "\\?"],
    ["^", "\\^"],
    ["$", "\\$"],
    ["{", "\\{"],
    ["}", "\\}"],
    ["(", "\\("],
    [")", "\\)"],
    ["|", "\\|"],
    ["[", "\\["],
    ["]", "\\]"],
    ["\\", "\\\\"],
  ])("escapes %s", (input, expected) => {
    expect(escapeRegex(input)).toBe(expected);
  });

  it("produces a pattern that compiles even with unbalanced parentheses", () => {
    const input = "Apoteka (Novi Sad";

    expect(() => new RegExp(escapeRegex(input), "i")).not.toThrow();
  });

  it("matches the input as a literal string, not as a wildcard pattern", () => {
    const escaped = escapeRegex("123.456");
    const regex = new RegExp(escaped, "i");

    expect(regex.test("123.456")).toBe(true);
    // Unescaped, "." would also match any character here.
    expect(regex.test("123X456")).toBe(false);
  });
});
