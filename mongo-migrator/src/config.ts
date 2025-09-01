import mongoose from "mongoose";
import mysql from "mysql2/promise";
import { env } from "./envVariables";

// MySQL connection configuration
const mysqlConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "ied2",
};

// MongoDB connection configuration
// Use MONGO_URI from environment variables if available, otherwise fallback to local
const mongoUrl = env.mongo.uri || "mongodb://0.0.0.0:27017/ied";

const mysqlConnection = async () => {
  return await mysql.createConnection(mysqlConfig);
};

// Connect to MongoDB
const mongoDbConnection = async () => {
  console.log(`[CONFIG] Attempting to connect to MongoDB at: ${mongoUrl}`);
  await mongoose.connect(mongoUrl, {});
  return mongoose.connection;
};

export { mysqlConnection, mongoDbConnection };
