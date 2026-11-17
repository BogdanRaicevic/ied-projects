import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// console.info, not console.error: instrument.ts forwards log/warn/error to
// Sentry Logs, and client errors don't belong there. They still reach pm2.
// Request data never goes in the first argument: console.* reads it as a
// format string, so a %c in a URL there would swallow the next argument.

// Registered before Sentry's error handler: a ZodError is bad client input,
// not a server bug, so it must not become a Sentry issue.
export function zodErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // From validateRequestBody and from Schema.parse(req.query) in handlers.
  if (err instanceof ZodError) {
    console.info(
      "Validation failed:",
      `${req.method} ${req.originalUrl} → 400`,
      err.issues,
    );
    res.status(400).json({ message: "Validation failed", errors: err.issues });
    return;
  }
  next(err);
}

// Last handler: logs every error with its request for pm2 and answers JSON
// instead of Express's HTML page. Sentry has already captured the 5xx ones.
export function errorWrapper(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // A response that already started can only be closed, which Express does.
  if (res.headersSent) {
    next(err);
    return;
  }

  // body-parser errors carry their own status: 400 bad JSON, 413 too large.
  const { status = 500, message } = (err ?? {}) as {
    status?: number;
    message?: string;
  };
  const line = `${req.method} ${req.originalUrl} → ${status}`;

  if (status < 500) {
    console.info("Request rejected:", line, message);
    res.status(status).json({ message });
    return;
  }
  // The cause stays in pm2 and Sentry, not in the response.
  console.error("Request failed:", line, err);
  res.status(500).json({ message: "Internal server error" });
}
