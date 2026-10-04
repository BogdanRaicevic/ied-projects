import { clerkClient, getAuth } from "@clerk/express";
import type { Request } from "express";
import mongoose from "mongoose";
import NodeCache from "node-cache";

// biome-ignore lint/suspicious:noExplicitAny: This is global ANY that will be removed later in a refactor
export type TODO_ANY = any;

export const validateMongoId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ID: ${id}`);
  }
};

// Every partial-match search filter builds a $regex straight from user
// input; without escaping, metacharacters (parens, dots, +, etc.) either
// throw "Regular expression is invalid" on Mongo's side or silently change
// what matches (e.g. "." matching any character).
export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Every date-range search filter (seminari, racuni, audit log) is fed a
// "datumDo"/"dateTo" from a date-only picker, which is midnight of the
// selected day. Comparing with $lte against that midnight excludes the
// entire day the user picked. Shifting the upper bound to the start of the
// next day and using an exclusive $lt instead covers the whole day
// regardless of what timezone the server runs in (pure millisecond
// arithmetic, no local-calendar mutation).
// QUICK FIX: bounds arrive as ISO strings on paths where nothing parses them
// into Dates before they reach here (GET /audit-log spreads the raw req.query
// — validateRequestQuery never writes the parsed data back — and POST
// /racuni/search has no body validation at all), which blew up on
// `to.getTime()`. Normalizing here keeps both endpoints alive; the real fix is
// to parse at the boundary so this helper can go back to taking Dates only.
const toDate = (value?: Date | string): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  // An unparseable bound would otherwise become an Invalid Date and make
  // Mongo throw; dropping it degrades to "no bound" instead of a 500.
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const toDateRangeFilter = (
  fromInput?: Date | string,
  toInput?: Date | string,
): { $gte?: Date; $lt?: Date } | undefined => {
  const from = toDate(fromInput);
  const to = toDate(toInput);

  if (!from && !to) {
    return undefined;
  }
  const filter: { $gte?: Date; $lt?: Date } = {};
  if (from) {
    filter.$gte = from;
  }
  if (to) {
    filter.$lt = new Date(to.getTime() + 24 * 60 * 60 * 1000);
  }
  return filter;
};

const CLERK_EMAIL_CACHE_TTL_SECONDS = 60 * 60 * 3; // 3 hours
const clerkEmailCache = new NodeCache({
  stdTTL: CLERK_EMAIL_CACHE_TTL_SECONDS,
});

// Single cached point of contact with Clerk for resolving a userId to an
// email. Returns null on any failure (Clerk unreachable, user has no email,
// etc.) so callers decide their own fallback instead of a Clerk hiccup
// implicitly becoming an HTTP error. Private: every caller has a Request
// in scope, so they should go through getClerkEmailFromRequest below.
const resolveClerkEmail = async (userId: string): Promise<string | null> => {
  const cached = clerkEmailCache.get<string>(userId);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress ?? null;
    if (email) {
      clerkEmailCache.set(userId, email);
    }
    return email;
  } catch (error) {
    console.error(`Failed to resolve Clerk email for user ${userId}:`, error);
    return null;
  }
};

export const getClerkEmailFromRequest = async (
  req: Request,
): Promise<string | null> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return null;
  }
  return resolveClerkEmail(auth.userId);
};
