import "dotenv/config";
import { z } from "zod";

// Load environment variables
const config = process.env;

// Fail at boot, not on first use. Report only key names: values are secrets.
const required = z
  .object({
    MONGO_URI: z.string().trim().min(1),
    BE_APP_PORT: z.coerce.number().int().positive(),
    CLERK_PUBLISHABLE_KEY: z.string().trim().min(1),
    CLERK_SECRET_KEY: z.string().trim().min(1),
  })
  .safeParse(config);
if (!required.success) {
  const keys = required.error.issues.map((issue) => issue.path.join("."));
  throw new Error(`Missing or invalid env variables: ${keys.join(", ")}`);
}

export const env = {
  serverName: config.SERVER_NAME,
  nodeEnv: config.NODE_ENV || "development",
  be: {
    appPort: required.data.BE_APP_PORT,
  },
  fe: {
    appUrl: config.FE_APP_URL,
    allowedPorts: config.FE_APP_ALLOWED_PORTS?.split(",").map(Number) || [],
  },
  mongo: {
    uri: required.data.MONGO_URI,
  },
  clerk: {
    publishableKey: required.data.CLERK_PUBLISHABLE_KEY,
    secretKey: required.data.CLERK_SECRET_KEY,
  },
  aws: {
    region: config.AWS_REGION,
    bucketName: config.S3_BUCKET_NAME,
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    shouldBackup: config.BACKUP_TO_S3 === "true",
  },
  sentry: {
    dsn: config.SENTRY_DSN,
  },
  features: {
    // Hides the QR payment block on Racuni V2 PDFs until a real QR encoder
    // ships. Defaults to false so production never renders the placeholder
    // api.qrserver.com image. Set RACUNI_V2_QR_CODE_ENABLED=true to enable
    // locally for QR layout work.
    racuniV2QrCode: config.RACUNI_V2_QR_CODE_ENABLED === "true",
  },
};
