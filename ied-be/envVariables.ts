// Import the dotenv package to load environment variables from.env file
import { config } from 'https://deno.land/x/dotenv/mod.ts';

// Load environment variables
const env = config();

export const ENV = {
  mongo: {
    uri: env.MONGO_URI,
    dbName: env.MONGO_DB_NAME,
    collections: {
      users: env.MONGO_DB_USER_COLLECTION,
    },
  },
  authKey: env.AUTH_KEY,
  beAppUri: env.BE_APP_URI,
  beAppPort: Number(env.BE_APP_PORT),
  feAppUri: env.FE_APP_URI,
  feAppPort: Number(env.FE_APP_PORT),
  auth: {
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
    baseURL: env.AUTH0_BASE_URL,
    authSecret: env.AUTH0_SECRET,
    callbackUrl: env.AUTH0_CALLBACK_URL,
  },
};
