import { Request, Response, NextFunction } from "express";

export function errorWrapper(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof Error) {
    res.status(500).send(err.message);
  } else {
    res.status(500).send("An unknown error occurred");
  }
}
