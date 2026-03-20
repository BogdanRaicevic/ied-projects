import * as Sentry from "@sentry/node";
import { env } from "./utils/envVariables";

const dsn = env.sentry.dsn;
const isProduction = env.nodeEnv === "production";

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  tracesSampleRate: isProduction ? 1.0 : 0.1,
  sendDefaultPii: true,
  includeLocalVariables: true,
  enableLogs: true,
  serverName: env.serverName || "development",
});
