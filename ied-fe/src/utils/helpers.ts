import { ZodError } from "zod";

export const formatToRSDNumber = (value: number | string) => {
  if (!value) return "";
  return Number(value).toLocaleString("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 2,
  });
};

type ErrorResult = [string, null];
type SuccessResult<T> = [null, T];
/**
 * Executes a promise and returns a formatted error string if it rejects, or null if it resolves.
 * @param promise The promise to execute.
 * @returns A Promise resolving to a formatted error string if the input promise rejects, otherwise resolving to null.
 */
async function handlePromiseError<T>(promise: Promise<T>): Promise<ErrorResult | SuccessResult<T>> {
  try {
    const data = await promise; // Wait for the promise to settle
    return [null, data]; // Success, return null
  } catch (error: unknown) {
    let errorMessage: string;
    if (error instanceof ZodError) {
      const formatted = error.issues
        .map((e) => `${e.path.join(".") || "validation"}: ${e.message}`)
        .join("; ");
      errorMessage = `Greška validacije: ${formatted}`; // Return formatted Zod error
    } else if (error instanceof Error) {
      if (error.message.toLowerCase().includes("backend error:")) {
        errorMessage = `Greška sa servera: ${error.message}`; // Return formatted backend error
      } else {
        errorMessage = error.message || "Došlo je do greške na serveru ili problema sa mrežom."; // Return generic error message
      }
    } else {
      errorMessage = "Došlo je do nepoznate greške."; // Return unknown error message
    }
    return [errorMessage, null]; // Return the error message
  }
}

export default handlePromiseError;
