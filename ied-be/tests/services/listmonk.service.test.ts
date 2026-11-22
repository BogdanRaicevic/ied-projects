import { MAILING_STATUS } from "ied-shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Firma } from "../../src/models/firma.model";
import { syncListmonk } from "../../src/services/listmonk.service";

vi.mock("../../src/utils/envVariables", () => ({
  env: {
    listmonk: { url: "https://lm.test", apiUser: "u", apiToken: "t" },
  },
}));

const BLOCKLISTED = "/api/subscribers?status=blocklisted&per_page=all";
const HARD = "/api/bounces?type=hard&per_page=all";
const COMPLAINT = "/api/bounces?type=complaint&per_page=all";

const respond = (byPath: Record<string, string[]>) => {
  const fetchMock = vi.fn(async (url: URL, init: RequestInit) => {
    expect(init.headers).toEqual({ Authorization: "token u:t" });
    const emails = byPath[`${url.pathname}${url.search}`];
    if (!emails) throw new Error(`unexpected URL ${url}`);
    return Response.json({
      data: { results: emails.map((email) => ({ email })) },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("syncListmonk", () => {
  it("sets blocklisted emails, with the bounce or complaint as the reason", async () => {
    const firma = await Firma.create({
      naziv_firme: "LM",
      e_mail: "Bounce@lm.rs",
      zaposleni: [
        { ime: "A", prezime: "A", e_mail: "spam@lm.rs" },
        { ime: "B", prezime: "B", e_mail: "block@lm.rs" },
      ],
    });
    respond({
      [BLOCKLISTED]: ["bounce@lm.rs", "spam@lm.rs", "block@lm.rs"],
      [HARD]: ["bounce@lm.rs"],
      [COMPLAINT]: ["spam@lm.rs"],
    });

    await syncListmonk();

    const f = await Firma.findById(firma._id).lean();
    expect(f?.mailing_status).toBe(MAILING_STATUS.HARD_BOUNCE);
    expect(f?.zaposleni.map((z) => z.mailing_status)).toEqual([
      MAILING_STATUS.SPAM_COMPLAINT,
      MAILING_STATUS.UNSUBSCRIBED,
    ]);
  });

  it("ignores bounce history of emails no longer blocklisted in listmonk", async () => {
    const firma = await Firma.create({
      naziv_firme: "LM2",
      e_mail: "released@lm.rs",
    });
    respond({
      [BLOCKLISTED]: [],
      [HARD]: ["released@lm.rs"],
      [COMPLAINT]: [],
    });

    await syncListmonk();

    const f = await Firma.findById(firma._id).lean();
    expect(f?.mailing_status).toBe(MAILING_STATUS.SUBSCRIBED);
  });

  it("throws when listmonk answers with an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 403 })),
    );

    await expect(syncListmonk()).rejects.toThrow("failed: 403");
  });

  it("throws when listmonk answers with an unexpected shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ results: [] })),
    );

    await expect(syncListmonk()).rejects.toThrow("unexpected response");
  });
});
