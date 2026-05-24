import { describe, expect, it } from "vitest";
import { TipRacuna } from "../../types/racuni.zod";
import {
  calcInvoiceTotals,
  calcKonacniDeduction,
  calcProizvodStavkaSubtotal,
  calcSeminarStavkaSubtotal,
  roundToTwoDecimals,
} from "./calculators";

describe("racuniV2 calculators — roundToTwoDecimals", () => {
  it.each([
    [1.005, 1.01],
    [1.004, 1],
    [0, 0],
    [123.456, 123.46],
    [0.1 + 0.2, 0.3],
  ])("rounds %s -> %s", (input, expected) => {
    expect(roundToTwoDecimals(input)).toBe(expected);
  });
});

describe("racuniV2 calculators — calcSeminarStavkaSubtotal", () => {
  it("computes online + offline bruto, popust, osnovica, PDV", () => {
    const subtotal = calcSeminarStavkaSubtotal(
      {
        tipStavke: "usluga",
        naziv: "Seminar A",
        datum: new Date("2026-01-15"),
        jedinicaMere: "Broj ucesnika",
        onlineKolicina: 2,
        onlineCena: 100,
        offlineKolicina: 1,
        offlineCena: 80,
        popust: 10,
        stopaPdv: 20,
      },
      { pdvObveznik: true },
    );

    expect(subtotal).toEqual({
      bruto: 280,
      popustIznos: 28,
      poreskaOsnovica: 252,
      pdv: 50.4,
      ukupno: 302.4,
    });
  });

  it("treats missing/non-numeric quantities as 0 (RHF raw input)", () => {
    const subtotal = calcSeminarStavkaSubtotal(
      {
        tipStavke: "usluga",
        naziv: "Empty seminar",
        datum: new Date("2026-01-15"),
        jedinicaMere: "Broj ucesnika",
        onlineKolicina: undefined as unknown as number,
        onlineCena: "not-a-number" as unknown as number,
        offlineKolicina: 0,
        offlineCena: 0,
        popust: 0,
        stopaPdv: 20,
      },
      { pdvObveznik: true },
    );

    expect(subtotal).toEqual({
      bruto: 0,
      popustIznos: 0,
      poreskaOsnovica: 0,
      pdv: 0,
      ukupno: 0,
    });
  });

  it("clamps popust > 100 to 100 (no negative osnovica)", () => {
    const subtotal = calcSeminarStavkaSubtotal(
      {
        tipStavke: "usluga",
        naziv: "Free seminar",
        datum: new Date("2026-01-15"),
        jedinicaMere: "Broj ucesnika",
        onlineKolicina: 1,
        onlineCena: 100,
        offlineKolicina: 0,
        offlineCena: 0,
        popust: 250,
        stopaPdv: 20,
      },
      { pdvObveznik: true },
    );

    expect(subtotal.poreskaOsnovica).toBe(0);
    expect(subtotal.pdv).toBe(0);
    expect(subtotal.ukupno).toBe(0);
  });
});

describe("racuniV2 calculators — calcProizvodStavkaSubtotal", () => {
  it("computes kolicina * cena - popust + PDV", () => {
    const subtotal = calcProizvodStavkaSubtotal(
      {
        tipStavke: "proizvod",
        naziv: "Prirucnik",
        jedinicaMere: "kom",
        kolicina: 3,
        cena: 50,
        popust: 0,
        stopaPdv: 10,
      },
      { pdvObveznik: true },
    );

    expect(subtotal).toEqual({
      bruto: 150,
      popustIznos: 0,
      poreskaOsnovica: 150,
      pdv: 15,
      ukupno: 165,
    });
  });
});

describe("racuniV2 calculators — calcInvoiceTotals", () => {
  it("aggregates mixed-rate invoice and breaks PDV down by rate", () => {
    const totals = calcInvoiceTotals(
      [
        {
          tipStavke: "usluga",
          naziv: "Seminar A",
          datum: new Date("2026-01-15"),
          jedinicaMere: "Broj ucesnika",
          onlineKolicina: 2,
          onlineCena: 100,
          offlineKolicina: 1,
          offlineCena: 80,
          popust: 10,
          stopaPdv: 20,
        },
        {
          tipStavke: "proizvod",
          naziv: "Prirucnik",
          jedinicaMere: "kom",
          kolicina: 3,
          cena: 50,
          popust: 0,
          stopaPdv: 10,
        },
        {
          tipStavke: "proizvod",
          naziv: "Prirucnik 2",
          jedinicaMere: "kom",
          kolicina: 2,
          cena: 25,
          popust: 0,
          stopaPdv: 10,
        },
      ],
      { pdvObveznik: true },
      TipRacuna.PREDRACUN,
    );

    expect(totals.ukupnaPoreskaOsnovica).toBe(452);
    expect(totals.ukupanPdv).toBe(70.4);
    expect(totals.ukupnaNaknada).toBe(522.4);
    expect(totals.pdvPoStopama).toEqual({
      "10": { osnovica: 200, pdv: 20 },
      "20": { osnovica: 252, pdv: 50.4 },
    });
    expect(totals.stavkaSubtotali).toHaveLength(3);
  });

  it("aggregates avansni stavke from avansBezPdv and per-stavka PDV rates", () => {
    const totals = calcInvoiceTotals(
      [
        {
          tipStavke: "usluga",
          naziv: "Avans za seminar",
          datum: new Date("2026-01-15"),
          jedinicaMere: "Broj ucesnika",
          onlineKolicina: 999,
          onlineCena: 999,
          offlineKolicina: 999,
          offlineCena: 999,
          popust: 50,
          stopaPdv: 20,
          avansBezPdv: 100,
        },
        {
          tipStavke: "proizvod",
          naziv: "Avans za prirucnik",
          jedinicaMere: "kom",
          kolicina: 999,
          cena: 999,
          popust: 50,
          stopaPdv: 10,
          avansBezPdv: 50,
        },
      ],
      { pdvObveznik: true },
      TipRacuna.AVANSNI_RACUN,
    );

    expect(totals.ukupnaPoreskaOsnovica).toBe(150);
    expect(totals.ukupanPdv).toBe(25);
    expect(totals.ukupnaNaknada).toBe(175);
    expect(totals.pdvPoStopama).toEqual({
      "10": { osnovica: 50, pdv: 5 },
      "20": { osnovica: 100, pdv: 20 },
    });
    expect(totals.stavkaSubtotali).toEqual([
      expect.objectContaining({
        naziv: "Avans za seminar",
        stopaPdv: 20,
        poreskaOsnovica: 100,
        pdv: 20,
        ukupno: 120,
      }),
      expect.objectContaining({
        naziv: "Avans za prirucnik",
        stopaPdv: 10,
        poreskaOsnovica: 50,
        pdv: 5,
        ukupno: 55,
      }),
    ]);
  });

  it("forces PDV to zero when izdavac is not PDV obveznik", () => {
    const totals = calcInvoiceTotals(
      [
        {
          tipStavke: "proizvod",
          naziv: "Kotizacija",
          jedinicaMere: "kom",
          kolicina: 5,
          cena: 10,
          popust: 10,
          stopaPdv: 20,
        },
        {
          tipStavke: "usluga",
          naziv: "Konsultacije",
          datum: new Date("2026-02-01"),
          jedinicaMere: "Broj ucesnika",
          onlineKolicina: 1,
          onlineCena: 200,
          offlineKolicina: 0,
          offlineCena: 0,
          popust: 0,
          stopaPdv: 20,
        },
      ],
      { pdvObveznik: false },
      TipRacuna.PREDRACUN,
    );

    expect(totals.ukupnaPoreskaOsnovica).toBe(245);
    expect(totals.ukupanPdv).toBe(0);
    expect(totals.ukupnaNaknada).toBe(245);
    expect(totals.pdvPoStopama).toEqual({
      "0": { osnovica: 245, pdv: 0 },
    });
    expect(totals.stavkaSubtotali.every((s) => s.stopaPdv === 0)).toBe(true);
  });

  it("subtracts placeno from ukupnaNaknada for tipRacuna=racun (but not from base/PDV)", () => {
    const totals = calcInvoiceTotals(
      [
        {
          tipStavke: "proizvod",
          naziv: "Knjiga",
          jedinicaMere: "kom",
          kolicina: 2,
          cena: 100,
          popust: 0,
          stopaPdv: 20,
        },
      ],
      { pdvObveznik: true },
      TipRacuna.RACUN,
      { placeno: 50 },
    );

    expect(totals.ukupnaPoreskaOsnovica).toBe(200);
    expect(totals.ukupanPdv).toBe(40);
    expect(totals.ukupnoPreOdbitaka).toBe(240);
    expect(totals.odbitak).toBe(50);
    expect(totals.ukupnaNaknada).toBe(190);
  });

  it("ignores placeno on non-racun types", () => {
    const totals = calcInvoiceTotals(
      [
        {
          tipStavke: "proizvod",
          naziv: "Knjiga",
          jedinicaMere: "kom",
          kolicina: 1,
          cena: 100,
          popust: 0,
          stopaPdv: 20,
        },
      ],
      { pdvObveznik: true },
      TipRacuna.PREDRACUN,
      { placeno: 999 },
    );

    expect(totals.odbitak).toBe(0);
    expect(totals.ukupnaNaknada).toBe(120);
  });

  it("returns zero totals for empty stavke", () => {
    const totals = calcInvoiceTotals(
      [],
      { pdvObveznik: true },
      TipRacuna.PREDRACUN,
    );

    expect(totals).toEqual({
      ukupnaPoreskaOsnovica: 0,
      ukupanPdv: 0,
      ukupnaNaknada: 0,
      ukupnoPreOdbitaka: 0,
      odbitak: 0,
      pdvPoStopama: {},
      stavkaSubtotali: [],
    });
  });

  it("applies konacni deduction provided via extras (Phase 3 will compute it; Phase 1 stub returns zeros)", () => {
    // Phase 1 stub: always zero. Verify the path is wired.
    const stubDeduction = calcKonacniDeduction([
      { avans: 120, avansPdv: 20, avansBezPdv: 100 },
      { avans: 60, avansPdv: 10, avansBezPdv: 50 },
    ]);
    expect(stubDeduction).toEqual({ avans: 0, avansPdv: 0, avansBezPdv: 0 });

    const stubTotals = calcInvoiceTotals(
      [
        {
          tipStavke: "proizvod",
          naziv: "Usluga realizacije",
          jedinicaMere: "kom",
          kolicina: 1,
          cena: 200,
          popust: 0,
          stopaPdv: 20,
        },
      ],
      { pdvObveznik: true },
      TipRacuna.KONACNI_RACUN,
      { konacniDeduction: stubDeduction },
    );

    expect(stubTotals.ukupnaPoreskaOsnovica).toBe(200);
    expect(stubTotals.ukupanPdv).toBe(40);
    expect(stubTotals.ukupnaNaknada).toBe(240);

    // Phase 3 simulation: caller injects a real deduction. The calculator
    // honors it on `odbitak` / `ukupnaNaknada` only — `ukupnaPoreskaOsnovica`
    // and `ukupanPdv` stay PRE-deduction so Pregled can show an explicit
    // avans line without double-counting (osnovica + pdv − odbitak ===
    // ukupnaNaknada). This is the contract Phase 3 wires real data into.
    const phase3Deduction = {
      avans: 180,
      avansPdv: 30,
      avansBezPdv: 150,
    };
    const wiredTotals = calcInvoiceTotals(
      [
        {
          tipStavke: "proizvod",
          naziv: "Usluga realizacije",
          jedinicaMere: "kom",
          kolicina: 1,
          cena: 200,
          popust: 0,
          stopaPdv: 20,
        },
      ],
      { pdvObveznik: true },
      TipRacuna.KONACNI_RACUN,
      { konacniDeduction: phase3Deduction },
    );

    expect(wiredTotals.ukupnaPoreskaOsnovica).toBe(200);
    expect(wiredTotals.ukupanPdv).toBe(40);
    expect(wiredTotals.ukupnoPreOdbitaka).toBe(240);
    expect(wiredTotals.odbitak).toBe(180);
    expect(wiredTotals.ukupnaNaknada).toBe(60);
  });

  it("multi-avansni konacni: deductions sum correctly when wired (Phase 3 contract)", () => {
    // Simulates Phase 3 having computed the sum of multiple linked avansni.
    // The calculator just consumes the aggregated deduction — multi-vs-single
    // is upstream's problem.
    const aggregated: { avans: number; avansPdv: number; avansBezPdv: number } =
      {
        avans: 0,
        avansPdv: 0,
        avansBezPdv: 0,
      };
    for (const a of [
      { avans: 120, avansPdv: 20, avansBezPdv: 100 },
      { avans: 60, avansPdv: 10, avansBezPdv: 50 },
      { avans: 11, avansPdv: 1, avansBezPdv: 10 },
    ]) {
      aggregated.avans = roundToTwoDecimals(aggregated.avans + a.avans);
      aggregated.avansPdv = roundToTwoDecimals(
        aggregated.avansPdv + a.avansPdv,
      );
      aggregated.avansBezPdv = roundToTwoDecimals(
        aggregated.avansBezPdv + a.avansBezPdv,
      );
    }

    const totals = calcInvoiceTotals(
      [
        {
          tipStavke: "proizvod",
          naziv: "Usluga realizacije",
          jedinicaMere: "kom",
          kolicina: 1,
          cena: 1000,
          popust: 0,
          stopaPdv: 20,
        },
      ],
      { pdvObveznik: true },
      TipRacuna.KONACNI_RACUN,
      { konacniDeduction: aggregated },
    );

    expect(totals.ukupnaPoreskaOsnovica).toBe(1000);
    expect(totals.ukupanPdv).toBe(200);
    expect(totals.ukupnoPreOdbitaka).toBe(1200);
    expect(totals.odbitak).toBe(191);
    expect(totals.ukupnaNaknada).toBe(1009);
  });
});

