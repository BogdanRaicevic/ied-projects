import {
	Router,
	type Request,
	type Response,
	type NextFunction,
} from "express";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.send("GET works");
	} catch (error) {
		next(error);
	}
});

router.post("/", async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.send("POST works");
	} catch (error) {
		next(error);
	}
});

router.put("/", async (_req: Request, res: Response, next: NextFunction) => {
	try {
		res.send("PUT works");
	} catch (error) {
		next(error);
	}
});

export default router;
