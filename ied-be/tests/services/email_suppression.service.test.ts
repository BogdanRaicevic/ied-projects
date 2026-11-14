import { type MailingStatus, SUPPRESSION_REASONS } from "ied-shared";
import { describe, expect, it } from "vitest";
import { EmailSuppression } from "../../src/models/email_suppression.model";
import { Firma } from "../../src/models/firma.model";
import {
  addSuppressedEmail,
  removeSuppressedEmail,
} from "../../src/services/email_suppression.service";

// Invariant: row with reason R ⇔ every firma and zaposleni with that email
// has mailing_status R; no row ⇔ SUBSCRIBED. Emails on contacts are stored
// as typed, the suppression list stores them lowercase.

const zaposleni = (e_mail: string, mailing_status: MailingStatus) => ({
  ime: "Pera",
  prezime: "Peric",
  e_mail,
  mailing_status,
});

const reasonOf = async (email: string) =>
  (await EmailSuppression.findOne({ email }).lean())?.reason;

describe("addSuppressedEmail", () => {
  it("sets the reason on every firma and zaposleni with that email, ignoring case", async () => {
    const firmaA = await Firma.create({
      naziv_firme: "A",
      e_mail: "Sync.Test@Firma.rs",
    });
    const firmaB = await Firma.create({
      naziv_firme: "B",
      e_mail: "b@firma.rs",
      zaposleni: [
        zaposleni("sync.test@FIRMA.rs", "SUBSCRIBED"),
        zaposleni("other@firma.rs", "SUBSCRIBED"),
      ],
    });

    await addSuppressedEmail([
      { email: "SYNC.TEST@firma.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
    ]);

    const a = await Firma.findById(firmaA._id).lean();
    const b = await Firma.findById(firmaB._id).lean();
    expect(a?.mailing_status).toBe("HARD_BOUNCE");
    expect(b?.zaposleni[0]?.mailing_status).toBe("HARD_BOUNCE");
    // untouched: different email
    expect(b?.mailing_status).toBe("SUBSCRIBED");
    expect(b?.zaposleni[1]?.mailing_status).toBe("SUBSCRIBED");
  });

  it("never downgrades HARD_BOUNCE / SPAM_COMPLAINT to UNSUBSCRIBED", async () => {
    const firma = await Firma.create({
      naziv_firme: "P",
      e_mail: "Bounce@perm.rs",
      zaposleni: [zaposleni("spam@PERM.rs", "SUBSCRIBED")],
    });
    await addSuppressedEmail([
      { email: "bounce@perm.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
      { email: "spam@perm.rs", reason: SUPPRESSION_REASONS.SPAM_COMPLAINT },
    ]);

    await addSuppressedEmail([
      { email: "bounce@perm.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
      { email: "SPAM@perm.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
    ]);

    expect(await reasonOf("bounce@perm.rs")).toBe("HARD_BOUNCE");
    expect(await reasonOf("spam@perm.rs")).toBe("SPAM_COMPLAINT");
    // contacts keep the row's reason, not the UNSUBSCRIBED of the import
    const p = await Firma.findById(firma._id).lean();
    expect(p?.mailing_status).toBe("HARD_BOUNCE");
    expect(p?.zaposleni[0]?.mailing_status).toBe("SPAM_COMPLAINT");
  });

  it("within one upload, a permanent reason wins over UNSUBSCRIBED in any order", async () => {
    await addSuppressedEmail([
      { email: "order1@perm.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
      { email: "order1@perm.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
      { email: "order2@perm.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
      { email: "order2@perm.rs", reason: SUPPRESSION_REASONS.SPAM_COMPLAINT },
    ]);

    expect(await reasonOf("order1@perm.rs")).toBe("HARD_BOUNCE");
    expect(await reasonOf("order2@perm.rs")).toBe("SPAM_COMPLAINT");
  });
});

describe("removeSuppressedEmail (re-subscribe)", () => {
  it("removes an UNSUBSCRIBED email and re-subscribes every contact with it", async () => {
    await addSuppressedEmail([
      { email: "back@firma.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
    ]);
    const firma = await Firma.create({
      naziv_firme: "C",
      e_mail: "Back@Firma.rs",
      mailing_status: "UNSUBSCRIBED",
      zaposleni: [zaposleni("BACK@firma.rs", "UNSUBSCRIBED")],
    });

    const result = await removeSuppressedEmail("back@FIRMA.rs");

    expect(result).not.toBeNull();
    expect(await reasonOf("back@firma.rs")).toBeUndefined();
    const c = await Firma.findById(firma._id).lean();
    expect(c?.mailing_status).toBe("SUBSCRIBED");
    expect(c?.zaposleni[0]?.mailing_status).toBe("SUBSCRIBED");
  });

  it("re-subscribes a contact unsubscribed without a suppression row (legacy)", async () => {
    const firma = await Firma.create({
      naziv_firme: "E",
      e_mail: "legacy@firma.rs",
      mailing_status: "UNSUBSCRIBED",
    });

    const result = await removeSuppressedEmail("legacy@firma.rs");

    expect(result).not.toBeNull();
    expect((await Firma.findById(firma._id).lean())?.mailing_status).toBe(
      "SUBSCRIBED",
    );
  });

  it("refuses a HARD_BOUNCE email: returns null, keeps it suppressed", async () => {
    await addSuppressedEmail([
      { email: "stay@firma.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
    ]);
    const firma = await Firma.create({
      naziv_firme: "D",
      e_mail: "stay@firma.rs",
      mailing_status: "HARD_BOUNCE",
    });

    const result = await removeSuppressedEmail("stay@firma.rs");

    expect(result).toBeNull();
    expect(await reasonOf("stay@firma.rs")).toBe("HARD_BOUNCE");
    expect((await Firma.findById(firma._id).lean())?.mailing_status).toBe(
      "HARD_BOUNCE",
    );
  });
});
