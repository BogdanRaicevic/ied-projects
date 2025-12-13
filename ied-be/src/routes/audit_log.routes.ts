import { AuditLogStatsQueryParamsZod } from "@ied-shared/types/audit_log.zod";
import { parseInt as parseIntCompat } from "es-toolkit/compat";
import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { validateRequestQuery } from "../middleware/validateSchema";
import {
  getAuditLogs,
  getUserChanges2,
  getUserChangesByDate,
  getUserChangesStats,
} from "../services/audit_log.service";

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

router.get(
  "/user-changes",
  validateRequestQuery(AuditLogStatsQueryParamsZod),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail, dateFrom, dateTo, model } = req.query;

      const result = await getUserChangesStats({
        userEmail: userEmail as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        model: (model as string) || "Firma",
      });

      console.log("hit");

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/user-changes-v2",
  validateRequestQuery(AuditLogStatsQueryParamsZod),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail, dateFrom, dateTo, model } = req.query;

      const result = await getUserChanges2({
        userEmail: userEmail as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        model: (model as string) || "Firma",
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/user-changes-by-date",
  validateRequestQuery(AuditLogStatsQueryParamsZod),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail, dateFrom, dateTo, model } = req.query;
      const result = await getUserChangesByDate({
        userEmail: userEmail as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        model: (model as string) || "Firma",
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
