import { SUPPRESSION_REASONS } from "ied-shared";
import { describe, expect, it } from "vitest";
import { EmailSuppression } from "../../src/models/email_suppression.model";
import { Firma } from "../../src/models/firma.model";
import {
  addSuppressedEmail,
  removeSuppressedEmail,
} from "../../src/services/email_suppression.service";

// Invariant: an email on the suppression list ⇒ every firma and zaposleni
// with that email has prijavljeni=false. Emails on contacts are stored as
// typed, the suppression list stores them lowercase.

const zaposleni = (e_mail: string, prijavljeni: boolean) => ({
  ime: "Pera",
  prezime: "Peric",
  e_mail,
  prijavljeni,
});

const reasonOf = async (email: string) =>
  (await EmailSuppression.findOne({ email }).lean())?.reason;

describe("addSuppressedEmail", () => {
  it("unsubscribes every firma and zaposleni with that email, ignoring case", async () => {
    const firmaA = await Firma.create({
      naziv_firme: "A",
      e_mail: "Sync.Test@Firma.rs",
      prijavljeni: true,
    });
    const firmaB = await Firma.create({
      naziv_firme: "B",
      e_mail: "b@firma.rs",
      prijavljeni: true,
      zaposleni: [
        zaposleni("sync.test@FIRMA.rs", true),
        zaposleni("other@firma.rs", true),
      ],
    });

    await addSuppressedEmail([
      { email: "SYNC.TEST@firma.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
    ]);

    const a = await Firma.findById(firmaA._id).lean();
    const b = await Firma.findById(firmaB._id).lean();
    expect(a?.prijavljeni).toBe(false);
    expect(b?.zaposleni[0]?.prijavljeni).toBe(false);
    // untouched: different email
    expect(b?.prijavljeni).toBe(true);
    expect(b?.zaposleni[1]?.prijavljeni).toBe(true);
  });

  it("never downgrades HARD_BOUNCE / SPAM_COMPLAINT to UNSUBSCRIBED", async () => {
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
      prijavljeni: false,
      zaposleni: [zaposleni("BACK@firma.rs", false)],
    });

    const result = await removeSuppressedEmail("back@FIRMA.rs");

    expect(result).not.toBeNull();
    expect(await reasonOf("back@firma.rs")).toBeUndefined();
    const c = await Firma.findById(firma._id).lean();
    expect(c?.prijavljeni).toBe(true);
    expect(c?.zaposleni[0]?.prijavljeni).toBe(true);
  });

  it("refuses a HARD_BOUNCE email: returns null, keeps it suppressed", async () => {
    await addSuppressedEmail([
      { email: "stay@firma.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
    ]);
    const firma = await Firma.create({
      naziv_firme: "D",
      e_mail: "stay@firma.rs",
      prijavljeni: false,
    });

    const result = await removeSuppressedEmail("stay@firma.rs");

    expect(result).toBeNull();
    expect(await reasonOf("stay@firma.rs")).toBe("HARD_BOUNCE");
    expect((await Firma.findById(firma._id).lean())?.prijavljeni).toBe(false);
  });
});
