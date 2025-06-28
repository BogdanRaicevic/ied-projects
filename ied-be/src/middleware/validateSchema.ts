import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        console.error("Validation Errors:", result.error.errors);
        res.status(400).json({
          message: "Validation failed",
          errors: result.error.errors,
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
