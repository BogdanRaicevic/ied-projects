import {
    type NextFunction,
    type Request,
    type Response,
    Router,
} from "express";
import { getAuditLogs } from "../services/audit_log.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getAuditLogs();
        if (!result) {
            res.status(404).send("Audit log not found");
            return;
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
