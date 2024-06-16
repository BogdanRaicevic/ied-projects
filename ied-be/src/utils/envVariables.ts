import "dotenv/config";

// Load environment variables
const config = process.env;

export const env = {
  be: {
    appUri: config.BE_APP_URI,
    appPort: Number(config.BE_APP_PORT),
  },
  fe: {
    appUri: config.FE_APP_URI,
    appPort: Number(config.FE_APP_PORT),
  },
  mongo: {
    uri: config.MONGO_URI,
  },
  auth: {
    domain: config.AUTH0_ISSUER_BASE_URL,
    clientId: config.AUTH0_CLIENT_ID,
    clientSecret: config.AUTH0_CLIENT_SECRET,
    baseURL: config.AUTH0_BASE_URL,
    secret: config.AUTH0_SECRET,
    key: config.AUTH_KEY,
  },
};
