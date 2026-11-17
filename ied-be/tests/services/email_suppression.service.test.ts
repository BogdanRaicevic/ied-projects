import {
  MAILING_STATUS,
  type MailingStatus,
  SUPPRESSION_REASONS,
} from "ied-shared";
import { describe, expect, it } from "vitest";
import { EmailSuppression } from "../../src/models/email_suppression.model";
import { Firma } from "../../src/models/firma.model";
import {
  addSuppressedEmail,
  deleteEmails,
  isEmailSuppressed,
  removeSuppressedEmail,
  setSuppressedEmail,
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
        zaposleni("sync.test@FIRMA.rs", MAILING_STATUS.SUBSCRIBED),
        zaposleni("other@firma.rs", MAILING_STATUS.SUBSCRIBED),
      ],
    });

    await addSuppressedEmail([
      { email: "SYNC.TEST@firma.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
    ]);

    const a = await Firma.findById(firmaA._id).lean();
    const b = await Firma.findById(firmaB._id).lean();
    expect(a?.mailing_status).toBe(MAILING_STATUS.HARD_BOUNCE);
    expect(b?.zaposleni[0]?.mailing_status).toBe(MAILING_STATUS.HARD_BOUNCE);
    // untouched: different email
    expect(b?.mailing_status).toBe(MAILING_STATUS.SUBSCRIBED);
    expect(b?.zaposleni[1]?.mailing_status).toBe(MAILING_STATUS.SUBSCRIBED);
  });

  it("never downgrades HARD_BOUNCE / SPAM_COMPLAINT to UNSUBSCRIBED", async () => {
    const firma = await Firma.create({
      naziv_firme: "P",
      e_mail: "Bounce@perm.rs",
      zaposleni: [zaposleni("spam@PERM.rs", MAILING_STATUS.SUBSCRIBED)],
    });
    await addSuppressedEmail([
      { email: "bounce@perm.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
      { email: "spam@perm.rs", reason: SUPPRESSION_REASONS.SPAM_COMPLAINT },
    ]);

    await addSuppressedEmail([
      { email: "bounce@perm.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
      { email: "SPAM@perm.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
    ]);

    expect(await reasonOf("bounce@perm.rs")).toBe(
      SUPPRESSION_REASONS.HARD_BOUNCE,
    );
    expect(await reasonOf("spam@perm.rs")).toBe(
      SUPPRESSION_REASONS.SPAM_COMPLAINT,
    );
    // contacts keep the row's reason, not the UNSUBSCRIBED of the import
    const p = await Firma.findById(firma._id).lean();
    expect(p?.mailing_status).toBe(MAILING_STATUS.HARD_BOUNCE);
    expect(p?.zaposleni[0]?.mailing_status).toBe(MAILING_STATUS.SPAM_COMPLAINT);
  });

  it("within one upload, the higher-ranked reason wins in any order", async () => {
    await addSuppressedEmail([
      { email: "order1@perm.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
      { email: "order1@perm.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
      { email: "order2@perm.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
      { email: "order2@perm.rs", reason: SUPPRESSION_REASONS.SPAM_COMPLAINT },
      { email: "order3@perm.rs", reason: SUPPRESSION_REASONS.SPAM_COMPLAINT },
      { email: "order3@perm.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
    ]);

    expect(await reasonOf("order1@perm.rs")).toBe(
      SUPPRESSION_REASONS.HARD_BOUNCE,
    );
    expect(await reasonOf("order2@perm.rs")).toBe(
      SUPPRESSION_REASONS.SPAM_COMPLAINT,
    );
    expect(await reasonOf("order3@perm.rs")).toBe(
      SUPPRESSION_REASONS.SPAM_COMPLAINT,
    );
  });
});

describe("addSuppressedEmail with INACTIVE", () => {
  it("UNSUBSCRIBED overwrites INACTIVE; INACTIVE never overwrites UNSUBSCRIBED", async () => {
    const firma = await Firma.create({ naziv_firme: "I", e_mail: "up@in.rs" });
    await addSuppressedEmail([
      { email: "up@in.rs", reason: SUPPRESSION_REASONS.INACTIVE },
      { email: "stays@in.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
    ]);
    expect(await reasonOf("up@in.rs")).toBe(SUPPRESSION_REASONS.INACTIVE);

    await addSuppressedEmail([
      { email: "up@in.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
      { email: "stays@in.rs", reason: SUPPRESSION_REASONS.INACTIVE },
    ]);

    expect(await reasonOf("up@in.rs")).toBe(SUPPRESSION_REASONS.UNSUBSCRIBED);
    expect(await reasonOf("stays@in.rs")).toBe(
      SUPPRESSION_REASONS.UNSUBSCRIBED,
    );
    expect((await Firma.findById(firma._id).lean())?.mailing_status).toBe(
      MAILING_STATUS.UNSUBSCRIBED,
    );
  });
});

describe("setSuppressedEmail (staff choice)", () => {
  it("moves UNSUBSCRIBED → INACTIVE and syncs every contact", async () => {
    await addSuppressedEmail([
      { email: "pick@firma.rs", reason: SUPPRESSION_REASONS.UNSUBSCRIBED },
    ]);
    const firma = await Firma.create({
      naziv_firme: "S",
      e_mail: "Pick@Firma.rs",
      mailing_status: MAILING_STATUS.UNSUBSCRIBED,
      zaposleni: [zaposleni("PICK@firma.rs", MAILING_STATUS.UNSUBSCRIBED)],
    });

    expect(
      await setSuppressedEmail("pick@FIRMA.rs", SUPPRESSION_REASONS.INACTIVE),
    ).not.toBeNull();

    expect(await reasonOf("pick@firma.rs")).toBe(SUPPRESSION_REASONS.INACTIVE);
    const f = await Firma.findById(firma._id).lean();
    expect(f?.mailing_status).toBe(MAILING_STATUS.INACTIVE);
    expect(f?.zaposleni[0]?.mailing_status).toBe(MAILING_STATUS.INACTIVE);
  });

  it("moves HARD_BOUNCE down; refuses SPAM_COMPLAINT and keeps it", async () => {
    await addSuppressedEmail([
      { email: "hb@firma.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
      { email: "sp@firma.rs", reason: SUPPRESSION_REASONS.SPAM_COMPLAINT },
    ]);

    expect(
      await setSuppressedEmail("hb@firma.rs", SUPPRESSION_REASONS.INACTIVE),
    ).not.toBeNull();
    expect(
      await setSuppressedEmail("sp@firma.rs", SUPPRESSION_REASONS.INACTIVE),
    ).toBeNull();
    expect(await reasonOf("hb@firma.rs")).toBe(SUPPRESSION_REASONS.INACTIVE);
    expect(await reasonOf("sp@firma.rs")).toBe(
      SUPPRESSION_REASONS.SPAM_COMPLAINT,
    );
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
      mailing_status: MAILING_STATUS.UNSUBSCRIBED,
      zaposleni: [zaposleni("BACK@firma.rs", MAILING_STATUS.UNSUBSCRIBED)],
    });

    const result = await removeSuppressedEmail("back@FIRMA.rs");

    expect(result).not.toBeNull();
    expect(await reasonOf("back@firma.rs")).toBeUndefined();
    const c = await Firma.findById(firma._id).lean();
    expect(c?.mailing_status).toBe(MAILING_STATUS.SUBSCRIBED);
    expect(c?.zaposleni[0]?.mailing_status).toBe(MAILING_STATUS.SUBSCRIBED);
  });

  it("re-subscribes a contact unsubscribed without a suppression row (legacy)", async () => {
    const firma = await Firma.create({
      naziv_firme: "E",
      e_mail: "legacy@firma.rs",
      mailing_status: MAILING_STATUS.UNSUBSCRIBED,
    });

    const result = await removeSuppressedEmail("legacy@firma.rs");

    expect(result).not.toBeNull();
    expect((await Firma.findById(firma._id).lean())?.mailing_status).toBe(
      MAILING_STATUS.SUBSCRIBED,
    );
  });

  it("re-subscribes a HARD_BOUNCE email", async () => {
    await addSuppressedEmail([
      { email: "hb-back@firma.rs", reason: SUPPRESSION_REASONS.HARD_BOUNCE },
    ]);

    expect(await removeSuppressedEmail("hb-back@firma.rs")).not.toBeNull();
    expect(await reasonOf("hb-back@firma.rs")).toBeUndefined();
  });

  it("refuses a SPAM_COMPLAINT email: returns null, keeps it suppressed", async () => {
    await addSuppressedEmail([
      { email: "stay@firma.rs", reason: SUPPRESSION_REASONS.SPAM_COMPLAINT },
    ]);
    const firma = await Firma.create({
      naziv_firme: "D",
      e_mail: "stay@firma.rs",
      mailing_status: MAILING_STATUS.SPAM_COMPLAINT,
    });

    const result = await removeSuppressedEmail("stay@firma.rs");

    expect(result).toBeNull();
    expect(await reasonOf("stay@firma.rs")).toBe(
      SUPPRESSION_REASONS.SPAM_COMPLAINT,
    );
    expect((await Firma.findById(firma._id).lean())?.mailing_status).toBe(
      MAILING_STATUS.SPAM_COMPLAINT,
    );
  });
});

describe("isEmailSuppressed", () => {
  it("normalizes whitespace and case", async () => {
    await EmailSuppression.create({
      email: "check@firma.rs",
      reason: SUPPRESSION_REASONS.HARD_BOUNCE,
    });

    expect(await isEmailSuppressed("  CHECK@firma.rs  ")).toBe(
      SUPPRESSION_REASONS.HARD_BOUNCE,
    );
    expect(await isEmailSuppressed("   ")).toBeNull();
  });
});

describe("deleteEmails", () => {
  it("clears the email and resets the status: no email → SUBSCRIBED", async () => {
    const { HARD_BOUNCE, SUBSCRIBED } = MAILING_STATUS;
    const firma = await Firma.create({
      naziv_firme: "G",
      e_mail: "Gone@Firma.rs",
      mailing_status: HARD_BOUNCE,
      zaposleni: [zaposleni("GONE@firma.rs", HARD_BOUNCE)],
    });

    await deleteEmails(["  gone@FIRMA.rs  "]);

    const g = await Firma.findById(firma._id).lean();
    expect(g).toMatchObject({ e_mail: "", mailing_status: SUBSCRIBED });
    expect(g?.zaposleni[0]).toMatchObject({
      e_mail: "",
      mailing_status: SUBSCRIBED,
    });
  });
});
