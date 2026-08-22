import { getAuth } from "@clerk/express";
import { isEqual } from "es-toolkit";
import type { NextFunction, Request, Response } from "express";
import { type Model, Types } from "mongoose";
import { AuditLog } from "../models/audit_log.model";
import { getClerkEmailFromRequest } from "../utils/utils";

export const createAuditMiddleware = <T>(Model: Model<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, params, body } = req;
    if (method === "GET") {
      return next(); // Skip GET requests
    }

    const auth = getAuth(req);
    // Falls back to the raw Clerk userId (not "system") when the email
    // lookup fails, so a Clerk hiccup is never mistaken for an actual
    // system-initiated action in the audit trail.
    const userEmail = auth?.userId
      ? ((await getClerkEmailFromRequest(req)) ?? auth.userId)
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
    let responseBody: T | null = null;
    const originalSend = res.send;
    res.send = function (data: T | null) {
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
          before: removeMetadataFields(documentBefore),
          after: removeMetadataFields(documentAfter),
        });

        await auditLog.save();
      } catch (error) {
        console.error("Audit Log Error:", error);
      }
    });

    next();
  };
};

const fetchDocumentBefore = async <T>(
  Model: Model<T>,
  id: string,
): Promise<T | null> => {
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

const fetchDocumentAfter = async <T>(
  Model: Model<T>,
  method: string,
  id: string,
  responseBody?: T | null,
): Promise<T | null> => {
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

// Metadata fields aren't declared on every model's TS type, but Mongoose
// adds them at runtime regardless (timestamps, __v) — cast is confined to
// this one spot rather than constraining every generic in this file to a
// shape most of them don't actually have.
const removeMetadataFields = <T>(document: T | null): Partial<T> | null => {
  if (!document) {
    return document;
  }
  const cleaned = { ...document } as Record<string, unknown>;
  delete cleaned.updated_at;
  delete cleaned.__v;
  delete cleaned.created_at;
  return cleaned as Partial<T>;
};

const shouldLogChange = <T>(before: T | null, after: T | null): boolean => {
  if (!before && after) {
    // Document created
    return true;
  }
  if (before && !after) {
    // Document deleted
    return true;
  }
  if (!before && !after) {
    // Nothing to log
    return false;
  }

  // Create copies and remove fields that should not be considered for change detection
  const beforeComparable = removeMetadataFields(before);
  const afterComparable = removeMetadataFields(after);

  if (before && after && isEqual(beforeComparable, afterComparable)) {
    return false; // No changes
  }
  return true;
};
