import "dotenv/config";

// Load environment variables
const config = process.env;

export const env = {
  be: {
    appPort: Number(config.BE_APP_PORT),
  },
  fe: {
    appUrl: config.FE_APP_URL,
    allowedPorts: config.FE_APP_ALLOWED_PORTS?.split(",").map(Number) || [],
  },
  mongo: {
    uri: config.MONGO_URI,
  },
  clerk: {
    publishableKey: config.CLERK_PUBLISHABLE_KEY,
    secretKey: config.CLERK_SECRET_KEY,
  },
  aws: {
    region: config.AWS_REGION,
    bucketName: config.S3_BUCKET_NAME,
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    shouldBackup: config.BACKUP_TO_S3 === "true",
  },
};
