import { SUPPRESSION_REASONS } from "ied-shared";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { EmailSuppression } from "../../src/models/email_suppression.model";
import { Firma } from "../../src/models/firma.model";
import {
  updateFirmaById,
  updateZaposleni,
} from "../../src/services/firma.service";

// Regression coverage: a partial update omitting e_mail used to skip the
// suppression check entirely (isEmailSuppressed(undefined) short-circuits
// to null), letting a bounced/suppressed address get silently reactivated.
describe("firma.service suppression re-check on partial updates", () => {
  it("updateFirmaById keeps prijavljeni=false when e_mail is omitted from the payload", async () => {
    const suppressedEmail = "bounced-firma@example.com";
    await EmailSuppression.create({
      email: suppressedEmail,
      reason: SUPPRESSION_REASONS.HARD_BOUNCE,
    });

    const firma = await Firma.create({
      naziv_firme: "Test Firma",
      e_mail: suppressedEmail,
      prijavljeni: false,
    });

    const updated = await updateFirmaById(firma._id.toString(), {
      prijavljeni: true,
    });

    expect(updated?.prijavljeni).toBe(false);
  });

  it("updateZaposleni keeps prijavljeni=false when e_mail is omitted from the payload", async () => {
    const suppressedEmail = "bounced-zaposleni@example.com";
    await EmailSuppression.create({
      email: suppressedEmail,
      reason: SUPPRESSION_REASONS.HARD_BOUNCE,
    });

    const zaposleniId = new Types.ObjectId();
    const firma = await Firma.create({
      naziv_firme: "Test Firma",
      zaposleni: [
        {
          _id: zaposleniId,
          ime: "Marko",
          prezime: "Markovic",
          radno_mesto: "Developer",
          e_mail: suppressedEmail,
          prijavljeni: false,
        },
      ],
    });

    const updated = await updateZaposleni(
      firma._id.toString(),
      zaposleniId.toString(),
      { prijavljeni: true },
    );

    expect(updated?.zaposleni[0]?.prijavljeni).toBe(false);
  });
});
