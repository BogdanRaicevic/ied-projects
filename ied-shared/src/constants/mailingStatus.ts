import { SUPPRESSION_REASONS, type SuppressionReasons } from "./email";

// Per email: a contact's status is its email's suppression reason, else SUBSCRIBED.
export const MAILING_STATUS = {
  SUBSCRIBED: "SUBSCRIBED",
  ...SUPPRESSION_REASONS,
} as const;

export type MailingStatus = keyof typeof MAILING_STATUS;

export const MAILING_STATUS_LABEL: Record<MailingStatus, string> = {
  SUBSCRIBED: "Prijavljeni",
  UNSUBSCRIBED: "Odjavljeni",
  HARD_BOUNCE: "Neispravan email",
  SPAM_COMPLAINT: "Spamovali su nas",
};

export const isPermanent = (
  s: MailingStatus,
): s is "HARD_BOUNCE" | "SPAM_COMPLAINT" =>
  s === MAILING_STATUS.HARD_BOUNCE || s === MAILING_STATUS.SPAM_COMPLAINT;

type ImportEvent = { type: "IMPORT"; reason: SuppressionReasons };
type MailingEvent =
  | { type: "UNSUBSCRIBE" }
  | { type: "RESUBSCRIBE" }
  | ImportEvent;

/**
 * Transition table of a mailing status. null = refused: bounce and spam are
 * permanent, the switch can't change them. An UNSUBSCRIBED import never
 * downgrades a permanent status; a permanent import always wins.
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
    return isPermanent(s) && !isPermanent(e.reason) ? s : e.reason;
  }
  if (isPermanent(s)) return null;
  return e.type === "UNSUBSCRIBE" ? "UNSUBSCRIBED" : "SUBSCRIBED";
}
