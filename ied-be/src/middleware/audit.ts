import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { type Model, Types } from "mongoose";
import { AuditLog } from "../models/audit_log.model";

export const createAuditMiddleware = (Model: Model<any>) => {
  // This is the actual middleware that will be returned and used by Express
  return async (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, params, body } = req;
    if (method === "GET") {
      return next(); // Skip GET requests
    }
    const auth = getAuth(req);

    let userEmail = "system";
    if (auth?.userId) {
      try {
        const user = await clerkClient.users.getUser(auth.userId);
        userEmail = user.primaryEmailAddress?.emailAddress ?? "system";
      } catch (e) {
        console.warn("Audit: unable to resolve user email for audit; defaulting to 'system'", e);
      }
    }

    // Check for an ID in route parameters first, then in the request body.
    const id: string = params?.id || body?._id || body?.id;

    let documentBefore: any = null;
    if (id && Types.ObjectId.isValid(id)) {
      try {
        documentBefore = await Model.findById(id).lean();
      } catch (error) {
        console.error(
          `Audit middleware could not find document in ${Model.modelName} with id: ${id}`,
          error,
        );
        // We can choose to continue or stop. Let's continue but the 'before' state will be null.
        documentBefore = null;
      }
    } else if (id) {
      console.warn(
        `Audit middleware received an invalid ID: ${id} for model ${Model.modelName}.
        This might be due to a malformed request or an incorrect route.`,
      );
    }

    res.on("finish", async () => {
      // Only log successful operations
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return;
      }

      let documentAfter: any = null;

      try {
        if (res.locals.updatedDocument) {
          documentAfter = res.locals.updatedDocument;
        } else if (method === "DELETE" && id) {
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
