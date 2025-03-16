import { clerkClient, getAuth } from "@clerk/express";
import type { Response, Request, NextFunction } from "express";
import NodeCache from "node-cache";

const myCache = new NodeCache();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes


export const hasPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res.status(403).send("Forbidden");
    }

    if (myCache.has(auth.userId)) {
      userStore.setCurrentUser(myCache.get(auth.userId) as string);
      next();
    } else {
      const currentUser = await getUserWithRetry(auth.userId);

      if (!currentUser) {
        console.error("Clerk API is unavailable. Skipping user store update.");
        return res.status(503).json({ error: "Service Unavailable. Please try again later." });
      }

      myCache.set(auth.userId, currentUser, CACHE_TTL);
      userStore.setCurrentUser(currentUser);
      next();
    }
  } catch (error) {
    console.error("Error in hasPermission", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to retry the Clerk API call
const getUserWithRetry = async (
  userId: string,
  retries = 3,
  delay = 1000
): Promise<string | null> => {
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

class UserStore {
  private currentUser: string | null = null;

  setCurrentUser(user: string) {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export const userStore = new UserStore();
