import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { type Model, Types } from "mongoose";
import { AuditLog } from "../models/audit_log.model";
import type { TODO_ANY } from "../utils/utils";

export const createAuditMiddleware = (Model: Model<TODO_ANY>) => {
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
      params.firmaId ||
      params.seminar_id ||
      body?._id ||
      body?.id;

    const documentBefore = await fetchDocumentBefore(Model, id);

    // Intercept response body
    let responseBody: TODO_ANY = null;
    const originalSend = res.send;
    res.send = function (data: TODO_ANY) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          responseBody = typeof data === "string" ? JSON.parse(data) : data;
        } catch (e) {
          responseBody = data;
        }
      }
      return originalSend.call(this, data);
    };

    res.on("finish", async () => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return; // Only log successful operations
      }

      const documentAfter = await fetchDocumentAfter(
        Model,
        method,
        id,
        responseBody,
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
  Model: Model<TODO_ANY>,
  id: string,
): Promise<TODO_ANY> => {
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
  Model: Model<TODO_ANY>,
  method: string,
  id: string,
  responseBody?: TODO_ANY,
): Promise<TODO_ANY> => {
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

  if (method === "POST" && responseBody) {
    console.log("Using response body for POST audit log.", responseBody);
    return responseBody;
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

const shouldLogChange = (before: TODO_ANY, after: TODO_ANY): boolean => {
  if (!before && !after) {
    return false; // Nothing to log
  }
  if (before && after && JSON.stringify(before) === JSON.stringify(after)) {
    return false; // No changes
  }
  return true;
};
