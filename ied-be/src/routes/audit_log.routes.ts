import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { AuditLogQueryParamsZod } from "ied-shared";
import z from "zod";
import {
  getAuditLogs,
  getUserChanges,
  getUserChangesByDate,
  getUserChangesStats,
} from "../services/audit_log.service";

const router = Router();

const AuditLogGetQuerySchema = AuditLogQueryParamsZod.extend({
  pageIndex: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

const statsParams = (query: unknown) => {
  const q = AuditLogQueryParamsZod.parse(query);
  return { ...q, model: q.model || "Firma" };
};

// Not called by the FE; used manually (curl/Bruno/Postman).
router.get(
  "/user-changes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await getUserChangesStats(statsParams(req.query)));
    } catch (error) {
      next(error);
    }
  },
);

// Not called by the FE; used manually (curl/Bruno/Postman).
router.get(
  "/user-changes-v2",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await getUserChanges(statsParams(req.query)));
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/user-changes-by-date",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await getUserChangesByDate(statsParams(req.query)));
    } catch (error) {
      next(error);
    }
  },
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageIndex, pageSize, ...filterParams } =
      AuditLogGetQuerySchema.parse(req.query);
    res.json(await getAuditLogs({ pageIndex, pageSize, filterParams }));
  } catch (error) {
    next(error);
  }
});

export default router;
