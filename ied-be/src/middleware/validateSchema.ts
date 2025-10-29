import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        console.error("Validation Errors:", result.error.issues);
        res.status(400).json({
          message: "Validation failed",
          errors: result.error.issues,
        });
        return;
      }

      req.body = result.data;
      next();
    } catch (error) {
      console.error("Unexpected Error during Validation Process:", error);
      res
        .status(500)
        .json({ message: "Internal server error during validation process" });
    }
  };
