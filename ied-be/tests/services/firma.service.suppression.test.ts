import { SUPPRESSION_REASONS } from "ied-shared";
import { Types } from "mongoose";
import { beforeAll, describe, expect, it } from "vitest";
import { EmailSuppression } from "../../src/models/email_suppression.model";
import { Firma } from "../../src/models/firma.model";
import type { Zaposleni } from "../../src/models/zaposleni.model";
import {
  create,
  createZaposleni,
  updateFirmaById,
  updateZaposleni,
} from "../../src/services/firma.service";

// mailing_status follows the email (suppression list) and can't be set by
// the client.
describe("firma.service mailing_status", () => {
  const bounced = "bounced@example.com";
  const spam = "spam@example.com";
  beforeAll(() =>
    EmailSuppression.create([
      { email: bounced, reason: SUPPRESSION_REASONS.HARD_BOUNCE },
      { email: spam, reason: SUPPRESSION_REASONS.SPAM_COMPLAINT },
    ]),
  );

  it("create / createZaposleni take the status of a suppressed email, ignoring the client's", async () => {
    const firma = await create({
      naziv_firme: "A",
      e_mail: "Bounced@Example.com",
      mailing_status: "SUBSCRIBED",
      zaposleni: [{ e_mail: spam, mailing_status: "SUBSCRIBED" } as Zaposleni],
    });
    expect(firma.mailing_status).toBe("HARD_BOUNCE");
    expect(firma.zaposleni[0]?.mailing_status).toBe("SPAM_COMPLAINT");

    const updated = await createZaposleni(firma._id.toString(), {
      e_mail: bounced,
      mailing_status: "SUBSCRIBED",
    } as Zaposleni);
    expect(updated?.zaposleni[1]?.mailing_status).toBe("HARD_BOUNCE");
  });

  it("updateFirmaById: email change → status of the new email; client value ignored", async () => {
    const firma = await Firma.create({ naziv_firme: "A", e_mail: "ok@x.rs" });
    const id = firma._id.toString();

    expect(
      (await updateFirmaById(id, { mailing_status: "UNSUBSCRIBED" }))
        ?.mailing_status,
    ).toBe("SUBSCRIBED");
    expect((await updateFirmaById(id, { e_mail: spam }))?.mailing_status).toBe(
      "SPAM_COMPLAINT",
    );
    expect(
      (
        await updateFirmaById(id, {
          e_mail: spam,
          mailing_status: "SUBSCRIBED",
        })
      )?.mailing_status,
    ).toBe("SPAM_COMPLAINT");
    expect(
      (await updateFirmaById(id, { e_mail: "new@x.rs" }))?.mailing_status,
    ).toBe("SUBSCRIBED");
  });

  it("updateFirmaById keeps a legacy UNSUBSCRIBED contact without email", async () => {
    const firma = await Firma.create({
      naziv_firme: "A",
      e_mail: "",
      mailing_status: "UNSUBSCRIBED",
    });

    const updated = await updateFirmaById(firma._id.toString(), {
      e_mail: "",
      naziv_firme: "B",
    });

    expect(updated?.mailing_status).toBe("UNSUBSCRIBED");
  });

  it("updateZaposleni: email change → status of the new email; client value ignored", async () => {
    const zaposleniId = new Types.ObjectId();
    const firma = await Firma.create({
      naziv_firme: "A",
      zaposleni: [{ _id: zaposleniId, ime: "Marko", e_mail: bounced }],
    });
    const update = (data: Partial<Zaposleni>) =>
      updateZaposleni(firma._id.toString(), zaposleniId.toString(), data);

    // created directly, so still the default; an unchanged email isn't recomputed
    expect(
      (await update({ e_mail: bounced }))?.zaposleni[0]?.mailing_status,
    ).toBe("SUBSCRIBED");
    expect(
      (await update({ e_mail: spam, mailing_status: "SUBSCRIBED" }))
        ?.zaposleni[0]?.mailing_status,
    ).toBe("SPAM_COMPLAINT");
    expect(
      (await update({ mailing_status: "SUBSCRIBED" }))?.zaposleni[0]
        ?.mailing_status,
    ).toBe("SPAM_COMPLAINT");
    expect(
      (await update({ e_mail: "new@x.rs" }))?.zaposleni[0]?.mailing_status,
    ).toBe("SUBSCRIBED");
  });
});
