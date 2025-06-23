import {
	Router,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import { getAllTipoviFirme } from "../services/tip_firme.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await getAllTipoviFirme();
		if (!result) {
			res.status(404).send("Tip firme not found");
			return;
		}
		res.json(result);
	} catch (error) {
		next(error);
	}
});

export default router;
