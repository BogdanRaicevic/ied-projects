import type { Request, Response, NextFunction } from "express";

export function errorWrapper(
	err: unknown,
	_req: Request,
	res: Response,
	next: NextFunction,
) {
	if (err instanceof Error) {
		console.error(err);
		next(err);
	} else {
		res.status(500).send("An unknown error occurred");
	}
}
