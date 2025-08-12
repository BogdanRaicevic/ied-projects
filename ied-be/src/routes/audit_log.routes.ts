import { type NextFunction, type Request, type Response, Router } from "express";
import { getAuditLogs } from "../services/audit_log.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageIndex, ...params } = req.query;
    let size = parseInt(pageSize as string, 10);
    let index = parseInt(pageIndex as string, 10);
    size = size < 0 || !Number.isNaN(size) ? 50 : size;
    index = index < 0 || !Number.isNaN(index) ? 0 : index;

    const result = await getAuditLogs({
      pageIndex: index,
      pageSize: size,
      filterParams: params,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
