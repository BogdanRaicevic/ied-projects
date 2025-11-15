import type { SuppressedEmail } from "@ied-shared/types/firma.zod";
import { parse } from "csv-parse";
import {
  type NextFunction,
  type Request,
  type Response,
  Router,
  raw,
} from "express";
import { addSuppressedEmail } from "../services/email_surrpression.service";

const router = Router();
const rawCsvParser = raw({ type: "text/csv", limit: "10mb" });

router.put(
  "/add",
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

export default router;
