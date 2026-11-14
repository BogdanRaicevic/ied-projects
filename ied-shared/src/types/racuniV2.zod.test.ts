import { describe, expect, it } from "vitest";
import { StavkaProizvodV2Zod, StavkaUslugaV2Zod } from "./racuniV2.zod";

const usluga = {
  tipStavke: "usluga",
  naziv: "Seminar",
  datum: "2026-01-15T00:00:00.000Z",
  onlineKolicina: 2,
  onlineCena: 1500.5,
  popust: 10,
};

const proizvod = {
  tipStavke: "proizvod",
  naziv: "Knjiga",
  kolicina: 3,
  cena: 990,
};

describe("racuniV2 stavke number fields", () => {
  it("parses valid numbers", () => {
    expect(StavkaUslugaV2Zod.parse(usluga).onlineCena).toBe(1500.5);
    expect(StavkaProizvodV2Zod.parse(proizvod).kolicina).toBe(3);
  });

  // An emptied NumberField puts null in the form; it must not become 0.
  it.each(["onlineCena", "onlineKolicina", "popust", "stopaPdv"])(
    "rejects empty (null) usluga.%s instead of coercing to 0",
    (key) => {
      expect(
        StavkaUslugaV2Zod.safeParse({ ...usluga, [key]: null }).success,
      ).toBe(false);
    },
  );

  it.each(["cena", "kolicina"])("rejects empty (null) proizvod.%s", (key) => {
    expect(
      StavkaProizvodV2Zod.safeParse({ ...proizvod, [key]: null }).success,
    ).toBe(false);
  });

  it("rejects fractional quantities", () => {
    const result = StavkaUslugaV2Zod.safeParse({
      ...usluga,
      onlineKolicina: 2.5,
    });
    expect(result.error?.issues[0]?.message).toBe("Mora biti ceo broj");
    expect(
      StavkaProizvodV2Zod.safeParse({ ...proizvod, kolicina: 1.5 }).success,
    ).toBe(false);
  });
});
