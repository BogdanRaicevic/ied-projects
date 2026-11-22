import { MAILING_STATUS } from "ied-shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Firma } from "../../src/models/firma.model";
import { syncListmonk } from "../../src/services/listmonk.service";

vi.mock("../../src/utils/envVariables", () => ({
  env: {
    listmonk: { url: "https://lm.test", apiUser: "u", apiToken: "t" },
  },
}));

const respond = (byPath: Record<string, string[]>) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: URL) => {
      const key = `${url.pathname}${url.search}`.replace("&per_page=all", "");
      const emails = byPath[key] ?? [];
      return Response.json({
        data: { results: emails.map((email) => ({ email })) },
      });
    }),
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("syncListmonk", () => {
  it("maps hard bounces, complaints, blocklisted and unsubscribed onto contacts", async () => {
    const firma = await Firma.create({
      naziv_firme: "LM",
      e_mail: "Bounce@lm.rs",
      zaposleni: [
        { ime: "A", prezime: "A", e_mail: "spam@lm.rs" },
        { ime: "B", prezime: "B", e_mail: "block@lm.rs" },
        { ime: "C", prezime: "C", e_mail: "unsub@lm.rs" },
        { ime: "D", prezime: "D", e_mail: "both@lm.rs" },
      ],
    });
    respond({
      "/api/bounces?type=hard": ["bounce@lm.rs", "both@lm.rs"],
      "/api/bounces?type=complaint": ["spam@lm.rs"],
      "/api/subscribers?status=blocklisted": ["block@lm.rs", "both@lm.rs"],
      "/api/subscribers?subscription_status=unsubscribed": ["unsub@lm.rs"],
    });

    await syncListmonk();

    const f = await Firma.findById(firma._id).lean();
    expect(f?.mailing_status).toBe(MAILING_STATUS.HARD_BOUNCE);
    expect(f?.zaposleni.map((z) => z.mailing_status)).toEqual([
      MAILING_STATUS.SPAM_COMPLAINT,
      MAILING_STATUS.UNSUBSCRIBED,
      MAILING_STATUS.UNSUBSCRIBED,
      // bounced and blocklisted: the higher rank wins
      MAILING_STATUS.HARD_BOUNCE,
    ]);
  });

  it("throws when listmonk answers with an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 403 })),
    );

    await expect(syncListmonk()).rejects.toThrow("failed: 403");
  });
});
