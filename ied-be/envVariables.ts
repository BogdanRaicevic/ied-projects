// Import the dotenv package to load environment variables from.env file
import { config } from 'https://deno.land/x/dotenv/mod.ts';

// Load environment variables
const env = config();

export const ENV = {
  mongoUri: env.MONGO_URI,
  mongoDbName: env.MONGO_DB_NAME,
  dbUserCollection: env.MONGO_DB_USER_COLLECTION,
  authKey: env.AUTH_KEY,
  beAppUri: env.BE_APP_URI,
  beAppPort: Number(env.BE_APP_PORT),
  feAppUri: env.FE_APP_URI,
  feAppPort: Number(env.FE_APP_PORT),
};
