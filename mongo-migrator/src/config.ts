import mongoose from 'mongoose';
import mysql from 'mysql2/promise';

// MySQL connection configuration
const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'ied2',
};

// MongoDB connection configuration
// when running in windows use 0.0.0.0 instead of localhost
const mongoUrl = 'mongodb://0.0.0.0:27017/ied';

const mysqlConnection = async () => {
  return await mysql.createConnection(mysqlConfig);
};
// Connect to MongoDB
const mongoDbConnection = async () => {
  await mongoose.connect(mongoUrl, {});
  return mongoose.connection;
};

export { mysqlConnection, mongoDbConnection };
