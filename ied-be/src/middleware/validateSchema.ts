import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Validating request body:", req.body);
      const result = await schema.safeParseAsync(req.body);

      console.log("Validation result:", result);
      if (!result.success) {
        console.error("Validation Errors:", result.error.errors);
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.errors,
        });
      }

      req.body = result.data;
      next();
    } catch (error) {
      console.error("Unexpected Error during Validation Process:", error);
      res.status(500).json({ message: "Internal server error during validation process" });
    }
  };
