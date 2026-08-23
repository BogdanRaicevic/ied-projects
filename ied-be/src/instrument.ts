import * as Sentry from "@sentry/node";
import { env } from "./utils/envVariables";

const dsn = env.sentry.dsn;
const isProduction = env.nodeEnv === "production";

const SENSITIVE_KEY_PATTERNS = ["jmbg", "mail", "telefon"];

const isSensitiveKey = (key: string) => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => lowerKey.includes(pattern));
};

const redactSensitiveData = (value: unknown): unknown => {
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

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  tracesSampleRate: isProduction ? 1.0 : 0.1,
  sendDefaultPii: false,
  includeLocalVariables: false,
  enableLogs: true,
  serverName: env.serverName || "development",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  beforeSend(event) {
    if (event.request?.data) {
      event.request.data = redactSensitiveData(event.request.data);
    }
    if (event.extra) {
      event.extra = redactSensitiveData(event.extra) as typeof event.extra;
    }
    return event;
  },
});
