import { ZodError, ZodSchema } from "zod";

export type ValidationError = {
  message: string;
  field?: string;
  value?: any;
  actualValue?: any;
};

export const extractErrorMessages = (errors: any, data: any): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  const processError = (error: any, parentField?: string, parentData?: any) => {
    if (Array.isArray(error)) {
      error.forEach((e, index) => processError(e, `${parentField}[${index}]`, parentData?.[index]));
    } else if (typeof error === "object" && error !== null) {
      Object.entries(error).forEach(([key, value]: [string, any]) => {
        if (value?.message) {
          validationErrors.push({
            message: value.message,
            field: parentField ? `${parentField}.${key}` : key,
            value: parentData?.[key], // Capture the actual value that caused the error
            actualValue: parentData,
          });
        } else {
          processError(value, key, parentData?.[key]);
        }
      });
    }
  };

  processError(errors, undefined, data);
  return validationErrors;
};

// Helper function to format Zod errors (optional but recommended)
export const formatZodErrors = (errors: ZodError["errors"]): string => {
  return errors
    .map((err) => {
      const path = err.path.join(".");
      return `${path ? `${path}: ` : ""}${err.message}`;
    })
    .join("; ");
};

export function validateOrThrow<T>(
  schema: ZodSchema<T>,
  data: unknown,
  context = "data validation"
): T {
  console.log(`Validating ${context}:`, data); // Log context
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Validation failed (${context}):`, result.error.errors);
    // --- Throw the original ZodError ---
    throw result.error;
  }
  return result.data;
}
