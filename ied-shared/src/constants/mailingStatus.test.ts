import { describe, expect, it } from "vitest";
import { type MailingStatus, nextMailingStatus } from "./mailingStatus";

const S = "SUBSCRIBED";
const U = "UNSUBSCRIBED";
const HB = "HARD_BOUNCE";
const SP = "SPAM_COMPLAINT";

// Rows = current status; columns = UNSUBSCRIBE, RESUBSCRIBE,
// import UNSUBSCRIBED, import HARD_BOUNCE, import SPAM_COMPLAINT.
const table: [MailingStatus, (MailingStatus | null)[]][] = [
  [S, [U, S, U, HB, SP]],
  [U, [U, S, U, HB, SP]],
  [HB, [null, null, HB, HB, SP]],
  [SP, [null, null, SP, HB, SP]],
];

const events = [
  { type: "UNSUBSCRIBE" },
  { type: "RESUBSCRIBE" },
  { type: "IMPORT", reason: U },
  { type: "IMPORT", reason: HB },
  { type: "IMPORT", reason: SP },
] as const;

describe("nextMailingStatus", () => {
  it.each(
    table.flatMap(([from, row]) =>
      events.map((event, i) => [from, event, row[i]] as const),
    ),
  )("%s + %o → %s", (from, event, expected) => {
    expect(nextMailingStatus(from, event)).toBe(expected);
  });
});
