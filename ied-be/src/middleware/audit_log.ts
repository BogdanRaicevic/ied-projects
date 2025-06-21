import { clerkClient, getAuth } from "@clerk/express";
import { Response, Request, NextFunction } from "express";
import NodeCache from "node-cache";
import { AuditLog } from "../models/audit_log.model";
import { Document, Model } from "mongoose";
import { BaseService } from "../services/base";

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
    return "unknown-email-fetch-failed";
  }
}

export const auditLogMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const methodsToLog = ["POST", "PUT", "DELETE", "PATCH"];
  const pathsToIgnore = [/search/i, /export/i];

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

      const logEntry = {
        userEmail,
        method: req.method,
        path: req.originalUrl,
        requestParams: req.params,
        requestQuery: req.query,
        requestBody: req.body,
        beforeChanges: res.locals.beforeChanges || undefined,
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


export const auditBeforeChange = <T extends Document>(service: BaseService<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!id) {
      return next();
    }

    try {
      const originalDoc = await service.findById(id);
      if (originalDoc) {
        res.locals.beforeChanges = originalDoc;
      }
    } catch (error) {
      console.error(
        `Audit: Failed to fetch document with id ${id}`,
        error
      );
    }

    next();
  };
};
