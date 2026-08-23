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
