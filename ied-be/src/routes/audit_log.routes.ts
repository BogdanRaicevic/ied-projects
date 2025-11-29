import { parseInt as parseIntCompat } from "es-toolkit/compat";
import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { getAuditLogs } from "../services/audit_log.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageIndex, ...params } = req.query;
    const index = parseIntCompat(pageIndex as string, 10) || 0;
    const size = parseIntCompat(pageSize as string, 10) || 50;

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
