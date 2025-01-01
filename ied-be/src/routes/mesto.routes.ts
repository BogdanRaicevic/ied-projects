import {
	Router,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import { getAllMesta } from "../services/mesta.service";

const router = Router();

router.get(
	"/all-names",
	async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await getAllMesta();
			if (!result) {
				return res.status(404).send("Mesta not found");
			}
			res.json(result);
		} catch (error) {
			next(error);
		}
	},
);

export default router;
