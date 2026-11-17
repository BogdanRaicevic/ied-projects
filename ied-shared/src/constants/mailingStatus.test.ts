import { describe, expect, it } from "vitest";
import {
  MAILING_STATUS,
  type MailingStatus,
  nextMailingStatus,
} from "./mailingStatus";

const S = MAILING_STATUS.SUBSCRIBED;
const I = MAILING_STATUS.INACTIVE;
const U = MAILING_STATUS.UNSUBSCRIBED;
const HB = MAILING_STATUS.HARD_BOUNCE;
const SP = MAILING_STATUS.SPAM_COMPLAINT;

// Rows = current status; columns = SET S, SET I, SET U, SET HB,
// import INACTIVE, UNSUBSCRIBED, HARD_BOUNCE, SPAM_COMPLAINT.
const table: [MailingStatus, (MailingStatus | null)[]][] = [
  [S, [S, I, U, HB, I, U, HB, SP]],
  [I, [S, I, U, HB, I, U, HB, SP]],
  [U, [S, I, U, HB, U, U, HB, SP]],
  [HB, [S, I, U, HB, HB, HB, HB, SP]],
  [SP, [null, null, null, null, SP, SP, SP, SP]],
];

const events = [
  { type: "SET", status: S },
  { type: "SET", status: I },
  { type: "SET", status: U },
  { type: "SET", status: HB },
  { type: "IMPORT", reason: I },
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
