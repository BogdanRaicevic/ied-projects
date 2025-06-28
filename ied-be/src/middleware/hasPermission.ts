import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";

const myCache = new NodeCache();
const CACHE_TTL = 60 * 60 * 3; // 3 hours in seconds

export const hasPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      res.status(403).send("Forbidden");
      return;
    }

    if (myCache.has(auth.userId)) {
      next();
    } else {
      const currentUser = await getUserWithRetry(auth.userId);

      if (!currentUser) {
        console.error("Clerk API is unavailable. Skipping user store update.");
        res
          .status(503)
          .json({ error: "Service Unavailable. Please try again later." });
        return;
      }

      myCache.set(auth.userId, currentUser, CACHE_TTL);
      next();
    }
  } catch (error) {
    console.error("Error in hasPermission", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

// Function to retry the Clerk API call
const getUserWithRetry = async (
  userId: string,
  retries = 3,
  delay = 1000,
): Promise<string | null> => {
  console.log(`Fetching user data for ${userId} from Clerk API`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const user = await clerkClient.users.getUser(userId);
      return user.primaryEmailAddress?.emailAddress || "unknown-user";
    } catch (error) {
      console.error(`Clerk API error (attempt ${attempt}):`, error);

      // If it's the last attempt, return null
      if (attempt === retries) return null;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return null;
};
