import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuditLog } from "../services/audit_log.service";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getAuditLog();
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
