import type { SertifikatType } from "ied-shared";
import { describe, expect, it } from "vitest";
import { getSertifikatPdfFileName } from "../../src/services/pdf.service";

const base: SertifikatType = {
  broj_sertifikata: 12,
  ime_prezime: "Petar Petrović",
  firma_naziv: "Firma DOO",
  seminar_naziv: "Seminar",
  datumi_seminara: "1. jun 2026",
  godina_seminara: "2026",
  templateKey: "ied",
};

describe("getSertifikatPdfFileName", () => {
  it("builds <broj>_<ime prezime>_<firma>.pdf", () => {
    expect(getSertifikatPdfFileName(base)).toBe("12_Petar_Petrovic_Firma_DOO.pdf");
  });

  it("shortens long company names", () => {
    const name = getSertifikatPdfFileName({
      ...base,
      firma_naziv: `${"Preduzeće za proizvodnju ".repeat(20)}DOO`,
    });
    expect(name).toBe("12_Petar_Petrovic_Preduzece_za_proizvodnju_Preduzece_za_pr.pdf");
  });
});
