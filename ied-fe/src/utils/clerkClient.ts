import { ClerkOfflineError } from "@clerk/react/errors";

let getTokenFn: (() => Promise<string | null>) | null = null;

export const setGetTokenFn = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

export const getClerkToken = async (): Promise<string | null> => {
  if (!getTokenFn) throw new Error("getTokenFn not set yet");
  try {
    return await getTokenFn();
  } catch (error) {
    // Core 3 throws ClerkOfflineError instead of returning null when offline;
    // preserve Core 2 semantics for downstream callers (e.g. axios interceptor).
    if (ClerkOfflineError.is(error)) {
      return null;
    }
    throw error;
  }
};
