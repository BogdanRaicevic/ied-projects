import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import type { Model } from "mongoose";
import { AuditLog } from "../models/audit_log.model";

export const createAuditMiddleware = (Model: Model<any>) => {
  // This is the actual middleware that will be returned and used by Express
  return async (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, params, body } = req;
    if (method === "GET") {
      return next(); // Skip GET requests
    }
    const auth = getAuth(req);

    const userEmail =
      (await clerkClient.users.getUser(auth.userId || "")).primaryEmailAddress?.emailAddress ||
      "system";

    // Check for an ID in route parameters first, then in the request body.
    const id = params.id || body._id;
    let documentBefore: any = null;

    // If an ID is found, fetch the document's state *before* the handler runs.
    // This now uses the generic 'Model' passed into the factory.
    if (id) {
      try {
        documentBefore = await Model.findById(id).lean();
      } catch (error) {
        console.error(
          `Audit middleware could not find document in ${Model.modelName} with id: ${id}`,
        );
        // We can choose to continue or stop. Let's continue but the 'before' state will be null.
        documentBefore = null;
      }
    }

    res.on("finish", async () => {
      // Only log successful operations
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return;
      }

      let documentAfter: any = null;

      try {
        if (method === "DELETE" && id) {
          documentAfter = null;
        } else if (method === "POST" && !id) {
          documentAfter = res.locals.newDocument || null;
        } else if (id) {
          // This was an UPDATE. Refetch the document using the generic Model.
          documentAfter = await Model.findById(id).lean();
        }

        if (
          id &&
          documentBefore &&
          JSON.stringify(documentBefore) === JSON.stringify(documentAfter)
        ) {
          return; // Nothing changed, no need to log.
        }

        if (!documentBefore && !documentAfter) {
          return; // Nothing to log.
        }

        const auditLog = new AuditLog({
          userEmail,
          method,
          route: originalUrl,
          resource: {
            model: Model.modelName,
            id: id,
          },
          before: documentBefore,
          after: documentAfter,
        });

        await auditLog.save();
      } catch (error) {
        console.error("Audit Log Error:", error);
      }
    });

    next();
  };
};
