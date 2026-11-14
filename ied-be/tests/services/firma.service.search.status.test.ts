import { MAILING_STATUS, type ParametriPretrage } from "ied-shared";
import { beforeAll, describe, expect, it } from "vitest";
import { Firma } from "../../src/models/firma.model";
import { search } from "../../src/services/firma.service";

// Table search: a status filter only judges contacts that have an email, so
// firme without any email always show.
describe("firma.service search by mailing_status", () => {
  beforeAll(() =>
    Firma.create([
      {
        naziv_firme: "hb",
        e_mail: "hb@x.rs",
        mailing_status: MAILING_STATUS.HARD_BOUNCE,
      },
      { naziv_firme: "none" },
      {
        naziv_firme: "firmOnly",
        e_mail: "ok@x.rs",
        zaposleni: [
          {
            ime: "Z",
            radno_mesto: "Dev",
            mailing_status: MAILING_STATUS.UNSUBSCRIBED,
          },
        ],
      },
      {
        naziv_firme: "zapUnsub",
        e_mail: "ok2@x.rs",
        zaposleni: [
          { e_mail: "u@x.rs", mailing_status: MAILING_STATUS.UNSUBSCRIBED },
        ],
      },
      {
        naziv_firme: "zapOnly",
        mailing_status: MAILING_STATUS.UNSUBSCRIBED,
        zaposleni: [{ e_mail: "y@x.rs", radno_mesto: "Ops" }],
      },
      // Same shape: the only zaposleni with an email is unsubscribed. The
      // stored status of the one without an email must not decide.
      {
        naziv_firme: "sub",
        e_mail: "s@x.rs",
        zaposleni: [
          { e_mail: "u1@x.rs", mailing_status: MAILING_STATUS.UNSUBSCRIBED },
          { ime: "N", mailing_status: MAILING_STATUS.SUBSCRIBED },
        ],
      },
      {
        naziv_firme: "legacy",
        e_mail: "l@x.rs",
        zaposleni: [
          { e_mail: "u2@x.rs", mailing_status: MAILING_STATUS.UNSUBSCRIBED },
          { ime: "N", mailing_status: MAILING_STATUS.UNSUBSCRIBED },
        ],
      },
      // The direktor has no email; the one with an email isn't a direktor.
      {
        naziv_firme: "rm",
        e_mail: "rm@x.rs",
        zaposleni: [
          { ime: "Dir", radno_mesto: "direktor" },
          {
            ime: "Rac",
            radno_mesto: "racunovodja",
            e_mail: "rac@x.rs",
            mailing_status: MAILING_STATUS.UNSUBSCRIBED,
          },
        ],
      },
    ]),
  );

  const nazivi = async (params: ParametriPretrage) =>
    (await search(params)).firmas.map((f) => f.naziv_firme).sort();
  const DEFAULT: ParametriPretrage = {
    firmaMailingStatus: [MAILING_STATUS.SUBSCRIBED],
    zaposleniMailingStatus: [MAILING_STATUS.SUBSCRIBED],
  };

  it("default filters keep firme and zaposleni without email", async () => {
    expect(await nazivi(DEFAULT)).toEqual(["firmOnly", "none", "zapOnly"]);
  });

  it("a zaposleni without email doesn't count as a match for the status filter", async () => {
    const result = await nazivi({
      zaposleniMailingStatus: [MAILING_STATUS.SUBSCRIBED],
    });
    expect(result).not.toContain("sub");
    expect(result).not.toContain("legacy");
  });

  it("the exemption only looks at zaposleni matching the other filters", async () => {
    expect(await nazivi({ ...DEFAULT, radnaMesta: ["direktor"] })).toEqual([
      "rm",
    ]);
  });

  it("other zaposleni filters still apply to zaposleni without email", async () => {
    expect(await nazivi({ ...DEFAULT, radnaMesta: ["Dev"] })).toEqual([
      "firmOnly",
    ]);
  });

  it("bounce filter: only the bounced firma plus firme without own email", async () => {
    expect(
      await nazivi({ firmaMailingStatus: [MAILING_STATUS.HARD_BOUNCE] }),
    ).toEqual(["hb", "none", "zapOnly"]);
  });
});
