import { IzdavacRacuna } from "ied-shared";
import { afterEach, describe, expect, it } from "vitest";
import { Izdavac } from "../../src/models/izdavac.model";
import { getIzdavac, getIzdavaci } from "../../src/services/izdavac.service";

const izdavac = (sifra: IzdavacRacuna, pdvObveznik = true) => ({
  sifra,
  naziv: sifra,
  kontaktTelefoni: [],
  pib: 100000000,
  maticniBroj: 10000000,
  tekuciRacuni: [`${sifra}-racun`],
  pdvObveznik,
});

describe("izdavac.service", () => {
  afterEach(async () => {
    await Izdavac.deleteMany({});
  });

  it("lists izdavači in the order they were added", async () => {
    await Izdavac.create(izdavac(IzdavacRacuna.BS));
    await Izdavac.create(izdavac(IzdavacRacuna.IED));

    const sifre = (await getIzdavaci()).map(({ sifra }) => sifra);

    expect(sifre).toEqual([IzdavacRacuna.BS, IzdavacRacuna.IED]);
  });

  it("returns one izdavač by sifra", async () => {
    await Izdavac.create(izdavac(IzdavacRacuna.PERMANENT, false));

    expect(await getIzdavac(IzdavacRacuna.PERMANENT)).toMatchObject({
      sifra: IzdavacRacuna.PERMANENT,
      pdvObveznik: false,
      tekuciRacuni: ["permanent-racun"],
    });
  });

  it("throws when the izdavač is not in the database", async () => {
    await expect(getIzdavac(IzdavacRacuna.IED)).rejects.toThrow(
      'Izdavac "ied" is missing',
    );
  });
});
