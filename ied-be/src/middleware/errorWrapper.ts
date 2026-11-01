import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorWrapper(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  // Handlers parse input with Schema.parse(); same shape as validateRequestBody.
  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", errors: err.issues });
    return;
  }
  if (err instanceof Error) {
    console.error(err);
    next(err);
  } else {
    res.status(500).send("An unknown error occurred");
  }
}
