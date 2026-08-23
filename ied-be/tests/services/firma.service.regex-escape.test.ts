import { beforeAll, describe, expect, it } from "vitest";
import { Firma } from "../../src/models/firma.model";
import * as firmaService from "../../src/services/firma.service";

// Regression coverage for the unescaped-$regex bug: search params were fed
// straight into MongoDB's $regex, so a name containing regex metacharacters
// (parentheses, dots, ...) could either crash the query or silently
// over-match via wildcard characters like ".".
describe("firma.service search — regex-unsafe input", () => {
  beforeAll(async () => {
    await Firma.insertMany([
      { naziv_firme: "Apoteka (Novi Sad)" },
      { naziv_firme: "Apoteka Beograd" },
      { naziv_firme: "123.456 Trade" },
      { naziv_firme: "123X456 Trade" },
    ]);
  });

  it("does not throw on a name containing parentheses", async () => {
    await expect(
      firmaService.search({ imeFirme: "Apoteka (Novi Sad)" }),
    ).resolves.toMatchObject({ totalDocuments: 1 });
  });

  it("does not throw on an unbalanced parenthesis", async () => {
    await expect(
      firmaService.search({ imeFirme: "Apoteka (Novi" }),
    ).resolves.toMatchObject({ totalDocuments: 1 });
  });

  it("treats '.' as a literal character, not a wildcard", async () => {
    const result = await firmaService.search({ imeFirme: "123.456" });

    expect(result.totalDocuments).toBe(1);
  });
});
