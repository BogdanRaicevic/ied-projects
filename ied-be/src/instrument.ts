import * as Sentry from "@sentry/node";
import { env } from "./utils/envVariables";

Sentry.init({
  dsn: env.sentry.dsn,
  tracesSampleRate: env.nodeEnv === "development" ? 1.0 : 0.1,
  sendDefaultPii: true,
  includeLocalVariables: true,
  enableLogs: true,
  serverName: env.serverName,
});
