import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use safeParseAsync which doesn't throw on first error
      // It returns an object indicating success or failure with accumulated errors
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        // If validation fails, send a 400 response with all accumulated errors
        console.error("Validation Errors:", result.error.errors);
        return res.status(400).json({
          message: "Validation failed",
          // result.error is a ZodError instance containing all issues
          errors: result.error.errors,
        });
      }

      // If validation is successful, assign the validated (and potentially transformed) data to req.body
      req.body = result.data;
      // Move to the next middleware/handler
      next();
    } catch (error) {
      // Catch unexpected errors during the validation process itself (not validation failures)
      console.error("Unexpected Error during Validation Process:", error);
      res.status(500).json({ message: "Internal server error during validation process" });
    }
  };
