import type { Request, Response, NextFunction } from "express";
import { ErrorWithCause } from "../utils/customErrors";

export function errorWrapper(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof ErrorWithCause) {
    res.status(400).json({
      status: "error",
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  } else if (err instanceof Error) {
    console.error(err);
    next(err);
  } else {
    res.status(500).send("An unknown error occurred");
  }
}
