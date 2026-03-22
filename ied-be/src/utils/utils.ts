import { clerkClient, getAuth } from "@clerk/express";
import type { Request } from "express";
import mongoose from "mongoose";

// biome-ignore lint/suspicious:noExplicitAny: This is global ANY that will be removed later in a refactor
export type TODO_ANY = any;

export const validateMongoId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ID: ${id}`);
  }
};

export const getClerkEmailFromRequest = async (
  req: Request,
): Promise<string> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      throw new Error("User not authenticated");
    }
    const clerkUser = await clerkClient.users.getUser(auth.userId);
    const userEmail = clerkUser.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      throw new Error("Could not resolve user email");
    }
    return userEmail;
  } catch (error) {
    console.error("Error resolving user email from request:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to resolve user email");
  }
};
