import { parse } from "csv-parse";
import { type Request, type Response, Router, raw } from "express";
import {
  type SetSuppressedEmail,
  SetSuppressedEmailSchema,
  type SuppressedEmail,
  SuppressedEmailSchema,
} from "ied-shared";
import { z } from "zod";
import { validateRequestBody } from "../middleware/validateSchema";
import {
  addSuppressedEmail,
  deleteEmails,
  isEmailSuppressed,
  removeSuppressedEmail,
  setSuppressedEmail,
} from "../services/email_suppression.service";

const router = Router();
const rawCsvParser = raw({ type: "text/csv", limit: "10mb" });
const normalizeCsvHeader = (header: string[]) =>
  header.map((column) =>
    column
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase(),
  );

router.put(
  "/add-csv-list",
  rawCsvParser,
  async (req: Request, res: Response) => {
    // ?reason=INACTIVE fills rows without a reason (an email-only list).
    const { reason } = SuppressedEmailSchema.pick({ reason: true })
      .partial()
      .parse(req.query);
    if (!req.body || req.body.length === 0) {
      return res.status(400).send("No file uploaded");
    }
    // Parse CSV from buffer
    const records: SuppressedEmail[] = await new Promise((resolve, reject) => {
      parse(
        req.body,
        {
          columns: normalizeCsvHeader,
          trim: true,
          skip_empty_lines: true,
        },
        (err, records) => {
          if (err) reject(err);
          else resolve(records as SuppressedEmail[]);
        },
      );
    });

    const result = await addSuppressedEmail(
      reason
        ? records.map((r) => ({ ...r, reason: r.reason || reason }))
        : records,
    );

    res.status(200).json(result);
  },
);

router.put(
  "/add-email",
  validateRequestBody(SetSuppressedEmailSchema),
  async (req: Request, res: Response) => {
    const { email, reason } = req.body as SetSuppressedEmail;
    const result = await setSuppressedEmail(email, reason);
    if (result === null) {
      res.status(409).json({
        message: "Email is permanently suppressed (SPAM_COMPLAINT)",
      });
      return;
    }

    res.status(200).json({ message: "Suppressed email set successfully" });
  },
);

router.delete(
  "/delete-emails",
  validateRequestBody(z.array(z.string())),
  async (req: Request, res: Response) => {
    const emails = req.body as string[];
    await deleteEmails(emails);

    res.status(202).send("Suppressed emails deleted successfully");
  },
);

router.delete(
  "/remove-email",
  validateRequestBody(SuppressedEmailSchema.pick({ email: true })),
  async (req: Request, res: Response) => {
    const { email } = req.body as Pick<SuppressedEmail, "email">;
    const removed = await removeSuppressedEmail(email);
    if (removed === null) {
      res.status(409).json({
        message: "Email is permanently suppressed (SPAM_COMPLAINT)",
      });
      return;
    }

    res.status(202).send("Suppressed email removed successfully");
  },
);

router.get("/check-status", async (req: Request, res: Response) => {
  const { email } = SuppressedEmailSchema.pick({ email: true }).parse(
    req.query,
  );
  const isSuppressed = await isEmailSuppressed(email);
  res.status(200).json(isSuppressed);
});

export default router;
