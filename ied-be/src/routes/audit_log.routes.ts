import { type NextFunction, type Request, type Response, Router } from "express";
import { getAuditLogs } from "../services/audit_log.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageIndex, ...params } = req.query;
    const size = parseInt(pageSize as string, 10) || 50;
    const index = parseInt(pageIndex as string, 10) || 0;

    const result = await getAuditLogs({
      pageIndex: index,
      pageSize: size,
      filterParams: params,
    });
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
