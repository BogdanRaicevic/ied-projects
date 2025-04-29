import { ZodError } from "zod";

export const formatToRSDNumber = (value: number | string) => {
  if (!value) return "";
  return Number(value).toLocaleString("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 2,
  });
};

/**
 * Executes a promise and returns a formatted error string if it rejects, or null if it resolves.
 * @param promise The promise to execute.
 * @returns A Promise resolving to a formatted error string if the input promise rejects, otherwise resolving to null.
 */
async function handlePromiseError<T>(promise: Promise<T>): Promise<string | null> {
  try {
    await promise; // Wait for the promise to settle
    return null; // Success, return null
  } catch (error: unknown) {
    console.error("handlePromiseError caught:", error); // Log the raw error

    if (error instanceof ZodError) {
      const formatted = error.errors
        .map((e) => `${e.path.join(".") || "validation"}: ${e.message}`)
        .join("; ");
      return `Greška validacije: ${formatted}`; // Return formatted Zod error
    } else if (error instanceof Error) {
      if (error.message.toLowerCase().includes("backend error:")) {
        return `Greška sa servera: ${error.message}`; // Return formatted backend error
      } else {
        return error.message || "Došlo je do greške na serveru ili problema sa mrežom."; // Return generic error message
      }
    } else {
      return "Došlo je do nepoznate greške."; // Return unknown error message
    }
  }
}

export default handlePromiseError;
