import { SUPPRESSION_REASONS } from "ied-shared";
import { z } from "zod";
import { env } from "../utils/envVariables";
import { addSuppressedEmail } from "./email_suppression.service";

const SOURCES = [
  ["/api/bounces?type=hard", SUPPRESSION_REASONS.HARD_BOUNCE],
  ["/api/bounces?type=complaint", SUPPRESSION_REASONS.SPAM_COMPLAINT],
  ["/api/subscribers?status=blocklisted", SUPPRESSION_REASONS.UNSUBSCRIBED],
  [
    "/api/subscribers?subscription_status=unsubscribed",
    SUPPRESSION_REASONS.UNSUBSCRIBED,
  ],
] as const;

const ListmonkResultsSchema = z.object({
  data: z.object({ results: z.array(z.object({ email: z.string() })) }),
});

const fetchEmails = async (path: string) => {
  const { url, apiUser, apiToken } = env.listmonk;
  if (!url || !apiUser || !apiToken) {
    throw new Error(
      "Listmonk sync: LISTMONK_URL, LISTMONK_API_USER or LISTMONK_API_TOKEN not set",
    );
  }
  const res = await fetch(new URL(`${path}&per_page=all`, url), {
    headers: { Authorization: `token ${apiUser}:${apiToken}` },
  });
  if (!res.ok) {
    throw new Error(`Listmonk GET ${path} failed: ${res.status}`);
  }
  const body = ListmonkResultsSchema.safeParse(await res.json());
  if (!body.success) {
    throw new Error(`Listmonk GET ${path}: unexpected response`, {
      cause: body.error,
    });
  }
  return body.data.data.results.map((r) => r.email);
};

// Re-reads everything each run: addSuppressedEmail never lowers a status, so
// re-importing is a no-op for emails already suppressed.
export const syncListmonk = async () => {
  const lists = await Promise.all(
    SOURCES.map(async ([path, reason]) =>
      (await fetchEmails(path)).map((email) => ({ email, reason })),
    ),
  );
  return addSuppressedEmail(lists.flat());
};
