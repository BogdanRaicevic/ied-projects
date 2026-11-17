import { parse } from "csv-parse";
import { Router, raw } from "express";
import {
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

router.put("/add-csv-list", rawCsvParser, async (req, res) => {
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
});

router.put(
  "/add-email",
  validateRequestBody(SetSuppressedEmailSchema),
  async (req, res) => {
    const { email, reason } = req.body;
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
  async (req, res) => {
    const emails = req.body;
    await deleteEmails(emails);

    res.status(200).send("Suppressed emails deleted successfully");
  },
);

router.delete(
  "/remove-email",
  validateRequestBody(SuppressedEmailSchema.pick({ email: true })),
  async (req, res) => {
    const { email } = req.body;
    const removed = await removeSuppressedEmail(email);
    if (removed === null) {
      res.status(409).json({
        message: "Email is permanently suppressed (SPAM_COMPLAINT)",
      });
      return;
    }

    res.status(200).send("Suppressed email removed successfully");
  },
);

router.get("/check-status", async (req, res) => {
  const { email } = SuppressedEmailSchema.pick({ email: true }).parse(
    req.query,
  );
  const isSuppressed = await isEmailSuppressed(email);
  res.status(200).json(isSuppressed);
});

export default router;
