import "dotenv/config";

// Load environment variables
const config = process.env;

export const env = {
  mongo: {
    uri: config.MONGO_URI,
  },
};
