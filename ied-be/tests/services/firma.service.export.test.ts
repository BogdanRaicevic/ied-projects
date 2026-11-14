import { MAILING_STATUS, type ParametriPretrage } from "ied-shared";
import { beforeAll, describe, expect, it } from "vitest";
import { Firma } from "../../src/models/firma.model";
import {
  exportSearchedFirmaData,
  exportSearchedZaposleniData,
} from "../../src/services/firma.service";

// A status filter only judges contacts that have an email; export also drops
// firme with no email anywhere.
describe("firma.service exports", () => {
  beforeAll(() =>
    Firma.create([
      {
        naziv_firme: "A",
        e_mail: "bounced@example.com",
        mailing_status: MAILING_STATUS.HARD_BOUNCE,
        zaposleni: [
          {
            ime: "Ana",
            prezime: "A",
            e_mail: "bounced@example.com",
            mailing_status: MAILING_STATUS.HARD_BOUNCE,
          },
          { ime: "Bora", prezime: "B", e_mail: "bora@example.com" },
        ],
      },
      { naziv_firme: "B", e_mail: "ok@example.com" },
      { naziv_firme: "C" },
      {
        naziv_firme: "D",
        mailing_status: MAILING_STATUS.UNSUBSCRIBED,
        zaposleni: [
          { ime: "Dina", prezime: "D", e_mail: "dina@example.com" },
          {
            ime: "Ema",
            prezime: "E",
            mailing_status: MAILING_STATUS.UNSUBSCRIBED,
          },
        ],
      },
    ]),
  );

  const nazivi = (rows: { naziv_firme?: string }[]) =>
    rows.map((r) => r.naziv_firme).sort();
  // Export has no sort order.
  const zaposleni = async (params: ParametriPretrage) =>
    (await exportSearchedZaposleniData(params)).sort((a, b) =>
      (a.imePrezime ?? "").localeCompare(b.imePrezime ?? ""),
    );

  it("firme follow the filter; no own email is kept, no email anywhere is dropped", async () => {
    expect(
      nazivi(
        await exportSearchedFirmaData({
          firmaMailingStatus: [MAILING_STATUS.SUBSCRIBED],
        }),
      ),
    ).toEqual(["B", "D"]);
    expect(
      nazivi(
        await exportSearchedFirmaData({
          firmaMailingStatus: [
            MAILING_STATUS.HARD_BOUNCE,
            MAILING_STATUS.SPAM_COMPLAINT,
          ],
        }),
      ),
    ).toEqual(["A", "D"]);
  });

  it("zaposleni follow the filter, including bounce/spam; no email is kept", async () => {
    expect(
      await zaposleni({
        zaposleniMailingStatus: [MAILING_STATUS.SUBSCRIBED],
      }),
    ).toEqual([
      { imePrezime: "Bora B", firma_naziv: "A", e_mail: "bora@example.com" },
      { imePrezime: "Dina D", firma_naziv: "D", e_mail: "dina@example.com" },
      { imePrezime: "Ema E", firma_naziv: "D", e_mail: "" },
    ]);
    expect(
      await zaposleni({
        zaposleniMailingStatus: [MAILING_STATUS.HARD_BOUNCE],
      }),
    ).toEqual([
      { imePrezime: "Ana A", firma_naziv: "A", e_mail: "bounced@example.com" },
    ]);
  });

  it("default filters don't drop a subscribed firma whose zaposleni have no email", async () => {
    expect(
      nazivi(
        await exportSearchedFirmaData({
          firmaMailingStatus: [MAILING_STATUS.SUBSCRIBED],
          zaposleniMailingStatus: [MAILING_STATUS.SUBSCRIBED],
        }),
      ),
    ).toEqual(["B", "D"]);
  });

  it("each export applies only its own status filter", async () => {
    const { SUBSCRIBED, HARD_BOUNCE } = MAILING_STATUS;
    // the zaposleni filter doesn't drop firma D's row
    expect(
      nazivi(
        await exportSearchedFirmaData({
          firmaMailingStatus: [SUBSCRIBED],
          zaposleniMailingStatus: [HARD_BOUNCE],
        }),
      ),
    ).toEqual(["B", "D"]);
    // the bounced firma A doesn't drop its subscribed zaposleni Bora
    expect(
      (
        await zaposleni({
          firmaMailingStatus: [SUBSCRIBED],
          zaposleniMailingStatus: [SUBSCRIBED],
        })
      ).map((z) => z.imePrezime),
    ).toEqual(["Bora B", "Dina D", "Ema E"]);
  });

  it("an empty filter exports every status", async () => {
    expect(
      nazivi(await exportSearchedFirmaData({ firmaMailingStatus: [] })),
    ).toEqual(["A", "B", "D"]);
    expect(
      await exportSearchedZaposleniData({ zaposleniMailingStatus: [] }),
    ).toHaveLength(4);
  });

  it("a missing filter (old FE bundle) exports only SUBSCRIBED", async () => {
    expect(nazivi(await exportSearchedFirmaData({}))).toEqual(["B", "D"]);
    expect((await zaposleni({})).map((z) => z.imePrezime)).toEqual([
      "Bora B",
      "Dina D",
      "Ema E",
    ]);
  });
});
