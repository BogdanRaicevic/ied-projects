import { ZodSchema } from "zod";

export function validateOrThrow<T>(
	schema: ZodSchema<T>,
	data: unknown,
	context = "data validation",
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
