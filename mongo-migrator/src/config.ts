import mongoose from "mongoose";
import mysql from "mysql2/promise";

// MySQL connection configuration
const mysqlConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "ied2",
};

// MongoDB connection configuration
const mongoUrl = "mongodb://localhost:27017/ied";

const mysqlConnection = async () => {
  return await mysql.createConnection(mysqlConfig);
};
// Connect to MongoDB
const mongoDbConnection = async () => {
  await mongoose.connect(mongoUrl, {});
  return mongoose.connection;
};

export { mysqlConnection, mongoDbConnection };
