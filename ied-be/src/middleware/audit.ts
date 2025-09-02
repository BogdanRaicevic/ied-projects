import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { type Model, Types } from "mongoose";
import { AuditLog } from "../models/audit_log.model";

export const createAuditMiddleware = (Model: Model<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, params, body } = req;
    if (method === "GET") {
      return next(); // Skip GET requests
    }

    const auth = getAuth(req);
    const userEmail = auth?.userId
      ? await resolveUserEmail(auth.userId)
      : "system";

    //TODO:  Great source of confusion, i need to fix this. This is pulling ids
    // from request params or body, but not all routes use the same naming convention
    // This is necessary to update when creating new audit middlewares for new models
    const id: string =
      params?.id ||
      body?._id ||
      body?.id ||
      params.firmaId ||
      params.seminar_id;
    const documentBefore = await fetchDocumentBefore(Model, id);

    res.on("finish", async () => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return; // Only log successful operations
      }

      const documentAfter = await fetchDocumentAfter(
        Model,
        method,
        id,
        req.body,
      );

      if (!shouldLogChange(documentBefore, documentAfter)) {
        return; // Skip logging if no changes occurred
      }

      try {
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

const resolveUserEmail = async (userId: string): Promise<string> => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user.primaryEmailAddress?.emailAddress ?? "system";
  } catch (error) {
    console.warn(
      "Audit: unable to resolve user email; defaulting to 'system'",
      error,
    );
    return "system";
  }
};

const fetchDocumentBefore = async (
  Model: Model<any>,
  id: string,
): Promise<any> => {
  if (id && Types.ObjectId.isValid(id)) {
    try {
      return await Model.findById(id).lean();
    } catch (error) {
      console.error(
        `Audit middleware could not find document in ${Model.modelName} with id: ${id}`,
        error,
      );
    }
  }
  return null;
};

const fetchDocumentAfter = async (
  Model: Model<any>,
  method: string,
  id: string,
  body: any,
): Promise<any> => {
  if (method === "DELETE") {
    // If there's no parent ID, we can't fetch anything.
    if (!id) {
      return null;
    }
    try {
      return await Model.findById(id).lean();
    } catch (error) {
      console.error(
        `Error fetching document after DELETE in ${Model.modelName} with id: ${id}`,
        error,
      );
      return null;
    }
  }

  if (!id) {
    return body;
  }

  if (id) {
    try {
      return await Model.findById(id).lean();
    } catch (error) {
      console.error(
        `Error fetching updated document in ${Model.modelName} with id: ${id}`,
        error,
      );
      return null;
    }
  }
  return null;
};

const shouldLogChange = (before: any, after: any): boolean => {
  if (!before && !after) {
    return false; // Nothing to log
  }
  if (before && after && JSON.stringify(before) === JSON.stringify(after)) {
    return false; // No changes
  }
  return true;
};
