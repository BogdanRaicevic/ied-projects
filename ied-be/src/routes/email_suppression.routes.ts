import {
  type SuppressedEmail,
  SuppressedEmailSchema,
} from "@ied-shared/types/firma.zod";
import { parse } from "csv-parse";
import {
  type NextFunction,
  type Request,
  type Response,
  Router,
  raw,
} from "express";
import {
  validateRequestBody,
  validateRequestQuery,
} from "../middleware/validateSchema";
import {
  addSuppressedEmail,
  isEmailSuppressed,
  removeSuppressedEmail,
} from "../services/email_suppression.service";

const router = Router();
const rawCsvParser = raw({ type: "text/csv", limit: "10mb" });

router.put(
  "/add-csv-list",
  rawCsvParser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || req.body.length === 0) {
        return res.status(400).send("No file uploaded");
      }
      // Parse CSV from buffer
      const records: SuppressedEmail[] = await new Promise(
        (resolve, reject) => {
          parse(
            req.body,
            {
              columns: (header) => header.map((col) => col.toLowerCase()),
              trim: true,
              skip_empty_lines: true,
            },
            (err, records) => {
              if (err) reject(err);
              else resolve(records as SuppressedEmail[]);
            },
          );
        },
      );

      await addSuppressedEmail(records);

      res.status(201).send("Suppressed emails added successfully");
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/add-email",
  validateRequestBody(SuppressedEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, reason } = req.body as SuppressedEmail;
    try {
      await addSuppressedEmail([{ email, reason }]);

      res.status(200).send("Suppressed email added successfully");
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/remove-email",
  validateRequestBody(SuppressedEmailSchema.pick({ email: true })),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as { email: string };
    try {
      await removeSuppressedEmail(email);

      res.status(200).send("Suppressed email removed successfully");
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/check-status",
  validateRequestQuery(SuppressedEmailSchema.pick({ email: true })),
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.query.email as string;
    try {
      const isSuppressed = await isEmailSuppressed(email);
      res.status(200).json(isSuppressed);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
