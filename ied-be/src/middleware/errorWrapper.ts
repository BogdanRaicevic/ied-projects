import { Request, Response, NextFunction } from "express";

export function errorWrapper(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof Error) {
    console.error(err);
    next(err);
  } else {
    res.status(500).send("An unknown error occurred");
  }
}
