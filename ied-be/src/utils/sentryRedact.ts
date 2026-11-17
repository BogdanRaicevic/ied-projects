const SENSITIVE_KEY_PATTERNS = ["jmbg", "mail", "telefon"];

const isSensitiveKey = (key: string) => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => lowerKey.includes(pattern));
};

export const redactSensitiveData = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        isSensitiveKey(key) ? "[REDACTED]" : redactSensitiveData(val),
      ]),
    );
  }
  return value;
};

// Sentry keeps the request body as the raw string it received, so it must be
// parsed before its keys can be checked. A body that isn't JSON (a CSV of
// emails, or a body Sentry cut off at its size limit) can't be checked: drop it.
export const redactRequestBody = (data: unknown): unknown => {
  if (typeof data !== "string") {
    return redactSensitiveData(data);
  }
  try {
    return JSON.stringify(redactSensitiveData(JSON.parse(data)));
  } catch {
    return "[REDACTED: not JSON]";
  }
};
