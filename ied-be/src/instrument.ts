import * as Sentry from "@sentry/node";
import { env } from "./utils/envVariables";
import { redactRequestBody, redactSensitiveData } from "./utils/sentryRedact";

const dsn = env.sentry.dsn;
const isProduction = env.nodeEnv === "production";

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  tracesSampleRate: isProduction ? 1.0 : 0.1,
  dataCollection: {
    userInfo: false,
  },
  includeLocalVariables: false,
  enableLogs: true,
  serverName: env.serverName || "development",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  beforeSend(event) {
    if (event.request?.data) {
      event.request.data = redactRequestBody(event.request.data);
    }
    if (event.extra) {
      event.extra = redactSensitiveData(event.extra) as typeof event.extra;
    }
    return event;
  },
});
