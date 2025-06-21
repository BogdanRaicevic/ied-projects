import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuditLogs } from "../services/audit_log.service";

const router = Router();

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageIndex = 0, pageSize = 50, filterParams = {} } = req.body;

        console.log('Request body:', req.body);
        const result = await getAuditLogs(
            Number(pageIndex),
            Number(pageSize),
            filterParams
        );
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
