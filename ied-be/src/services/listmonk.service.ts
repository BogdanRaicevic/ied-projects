import * as Sentry from "@sentry/node";
import { SUPPRESSION_REASONS, type SuppressionReasons } from "ied-shared";
import { z } from "zod";
import { env } from "../utils/envVariables";
import { addSuppressedEmail } from "./email_suppression.service";

const ListmonkResultsSchema = z.object({
  data: z.object({ results: z.array(z.object({ email: z.string() })) }),
});

export const isListmonkConfigured = () => {
  const { url, apiUser, apiToken } = env.listmonk;
  return Boolean(url && apiUser && apiToken);
};

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

// Mirrors listmonk's current blocklist. Bounce history outlives an unblock in
// listmonk, so bounces only pick the reason for emails still blocklisted.
export const syncListmonk = async () => {
  const [blocklisted, hard, complaint] = await Promise.all([
    fetchEmails("/api/subscribers?status=blocklisted"),
    fetchEmails("/api/bounces?type=hard"),
    fetchEmails("/api/bounces?type=complaint"),
  ]);
  const blocked = new Set(blocklisted);
  const withReason = (emails: string[], reason: SuppressionReasons) =>
    emails
      .filter((email) => blocked.has(email))
      .map((email) => ({ email, reason }));

  // addSuppressedEmail keeps the highest-ranked reason per email.
  return addSuppressedEmail([
    ...withReason(blocklisted, SUPPRESSION_REASONS.UNSUBSCRIBED),
    ...withReason(hard, SUPPRESSION_REASONS.HARD_BOUNCE),
    ...withReason(complaint, SUPPRESSION_REASONS.SPAM_COMPLAINT),
  ]);
};

let running = false;

// Cron and route entry: logs the result, sends errors to Sentry.
export const runListmonkSync = async () => {
  if (running) {
    console.log("Listmonk sync skipped - already running");
    return;
  }
  running = true;
  try {
    const { failures, ...counts } = await syncListmonk();
    console.log("Listmonk sync done:", counts, failures.slice(0, 20));
  } catch (error) {
    Sentry.captureException(error);
    console.error("Listmonk sync failed:", error);
  } finally {
    running = false;
  }
};
