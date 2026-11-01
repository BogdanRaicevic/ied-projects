import { SUPPRESSION_REASONS } from "ied-shared";
import { describe, expect, it } from "vitest";
import { EmailSuppression } from "../../src/models/email_suppression.model";
import { Firma } from "../../src/models/firma.model";
import {
  exportSearchedFirmaData,
  exportSearchedZaposleniData,
} from "../../src/services/firma.service";

describe("firma.service exports", () => {
  it("drop suppressed emails, keep rows without an email", async () => {
    await EmailSuppression.create({
      email: "bounced@example.com",
      reason: SUPPRESSION_REASONS.HARD_BOUNCE,
    });
    await Firma.create([
      {
        naziv_firme: "A",
        e_mail: "Bounced@example.com",
        zaposleni: [
          { ime: "Ana", prezime: "A", e_mail: "bounced@example.com" },
          { ime: "Bora", prezime: "B", e_mail: "bora@example.com" },
        ],
      },
      { naziv_firme: "B", e_mail: "ok@example.com" },
      { naziv_firme: "C" },
    ]);

    const firme = await exportSearchedFirmaData({});
    expect(firme.map((f) => f.naziv_firme).sort()).toEqual(["B", "C"]);

    const zaposleni = await exportSearchedZaposleniData({});
    expect(zaposleni).toEqual([
      { imePrezime: "Bora B", firma_naziv: "A", e_mail: "bora@example.com" },
    ]);
  });
});
