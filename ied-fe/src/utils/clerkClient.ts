import { Clerk } from "@clerk/clerk-js";

export const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

// Boot ClerkJS at runtime
let clerkLoaded = false;

export async function initClerk() {
  if (!clerkLoaded) {
    await clerk.load();
    clerkLoaded = true;
  }
}
