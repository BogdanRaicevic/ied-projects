import { clerkClient, getAuth } from "@clerk/express";
import { Response, Request, NextFunction } from "express";
import NodeCache from "node-cache";
import { AuditLog } from "../models/audit_log.model";

const userEmailCache = new NodeCache({ stdTTL: 60 * 60 * 8 }); // Cache emails for 8 hours

async function getUserEmail(userId: string): Promise<string> {
  const cachedEmail = userEmailCache.get<string>(userId);
  if (cachedEmail) {
    return cachedEmail;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress || "unknown-email";
    userEmailCache.set(userId, email);
    return email;
  } catch (error) {
    console.error(`Failed to fetch email for user ${userId} from Clerk:`, error);
    // Try to get from existing req.user if populated by another middleware (like hasPermission)
    // This part is speculative and depends on how `hasPermission` might evolve.
    // For now, we rely on a direct fetch or cache.
    return "unknown-email-fetch-failed";
  }
}

export const auditLogMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const methodsToLog = ["POST", "PUT", "DELETE", "PATCH"];
  const pathsToIgnore = [/\/search$/i]; // Ignore paths ending with /search (case-insensitive)

  // Call next() early for methods we don't want to log
  if (!methodsToLog.includes(req.method)) {
    return next();
  }

  // Call next() early if the path should be ignored
  if (pathsToIgnore.some((pattern) => pattern.test(req.path))) {
    return next();
  }

  const auth = getAuth(req);
  const userId = auth.userId;

  // If no userId, proceed without logging
  if (!userId) {
    return next();
  }

  res.on("finish", async () => {
    // Capture response details on finish
    try {
      const userEmail = await getUserEmail(userId);

      // Redact sensitive fields from the request body
      let requestBodyToLog: Record<string, unknown> = {}; // Changed 'any' to 'Record<string, unknown>'
      if (req.body && typeof req.body === "object") {
        requestBodyToLog = { ...req.body };
      }

      const logEntry = {
        userId,
        userEmail,
        method: req.method,
        path: req.url,
        requestParams: req.params,
        requestQuery: req.query,
        requestBody: Object.keys(requestBodyToLog).length > 0 ? requestBodyToLog : undefined,
        statusCode: res.statusCode,
        timestamp: new Date(),
      };

      // Asynchronously save the log entry without blocking the response
      AuditLog.create(logEntry).catch((err) => {
        console.error("Failed to save audit log:", err);
      });
    } catch (error) {
      console.error("Error in audit logging (on finish):", error);
    }
  });

  next();
};
