import { SUPPRESSION_REASONS, type SuppressionReasons } from "./email";

// Per email: a contact's status is its email's suppression reason, else SUBSCRIBED.
export const MAILING_STATUS = {
  SUBSCRIBED: "SUBSCRIBED",
  ...SUPPRESSION_REASONS,
} as const;

export type MailingStatus = keyof typeof MAILING_STATUS;

export const MAILING_STATUS_LABEL: Record<MailingStatus, string> = {
  SUBSCRIBED: "Prijavljeni",
  INACTIVE: "Neaktivni",
  UNSUBSCRIBED: "Odjavljeni",
  HARD_BOUNCE: "Neispravan email",
  SPAM_COMPLAINT: "Spamovali su nas",
};

// Only spam is permanent: some Sendy/listmonk hard bounces were reachable.
export const isPermanent = (s: MailingStatus): s is "SPAM_COMPLAINT" =>
  s === MAILING_STATUS.SPAM_COMPLAINT;

/** The statuses staff can pick by hand; spam comes only from imports. */
export type SettableMailingStatus = Exclude<MailingStatus, "SPAM_COMPLAINT">;

// An import never replaces a higher rank.
const RANK = {
  SUBSCRIBED: 0,
  INACTIVE: 1,
  UNSUBSCRIBED: 2,
  HARD_BOUNCE: 3,
  SPAM_COMPLAINT: 4,
} as const satisfies Record<MailingStatus, number>;

export const outranks = (a: MailingStatus, b: MailingStatus) =>
  RANK[a] > RANK[b];

type ImportEvent = { type: "IMPORT"; reason: SuppressionReasons };
type MailingEvent =
  | { type: "SET"; status: SettableMailingStatus }
  | ImportEvent;

/**
 * Transition table of a mailing status. null = refused: spam is permanent,
 * staff can't change it. An import keeps a higher-ranked status (see RANK).
 */
export function nextMailingStatus(
  s: MailingStatus,
  e: ImportEvent,
): SuppressionReasons;
export function nextMailingStatus(
  s: MailingStatus,
  e: MailingEvent,
): MailingStatus | null;
export function nextMailingStatus(
  s: MailingStatus,
  e: MailingEvent,
): MailingStatus | null {
  if (e.type === "IMPORT") {
    return outranks(s, e.reason) ? s : e.reason;
  }
  return isPermanent(s) ? null : e.status;
}
