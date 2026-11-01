import mongoose from "mongoose";
import { env } from "./envVariables";

// MongoDB connection configuration
// Use MONGO_URI from environment variables if available, otherwise fallback to local
const mongoUrl = env.mongo.uri || "mongodb://0.0.0.0:27017/ied";

// Connect to MongoDB
const mongoDbConnection = async () => {
  console.log(`[CONFIG] Attempting to connect to MongoDB`);
  await mongoose.connect(mongoUrl, {});
  return mongoose.connection;
};

export { mongoDbConnection };
