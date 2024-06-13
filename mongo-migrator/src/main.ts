import mysql, { RowDataPacket } from "mysql2/promise";
import { MongoClient } from "mongodb";

// MySQL connection configuration
const mysqlConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "ied2",
};

// MongoDB connection configuration
const mongoUrl = "mongodb://localhost:27017";
const mongoDbName = "ied";
const mongoCollectionName = "firma";

async function migrate() {
  // Connect to MySQL
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  console.log("Connected to MySQL");

  // Connect to MongoDB
  const mongoClient = new MongoClient(mongoUrl);
  await mongoClient.connect();
  console.log("Connected to MongoDB");
  const mongoDb = mongoClient.db(mongoDbName);
  const mongoCollection = mongoDb.collection(mongoCollectionName);

  try {
    // Fetch data from MySQL
    const [rows] = await mysqlConnection.execute<RowDataPacket[]>(
      "SELECT * FROM firma"
    );
    console.log(`Fetched ${rows.length} rows from MySQL`);

    // Insert data into MongoDB
    const result = await mongoCollection.insertMany(rows);
    console.log(`Inserted ${result.insertedCount} documents into MongoDB`);
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    // Close connections
    await mysqlConnection.end();
    await mongoClient.close();
    console.log("Connections closed");
  }
}

migrate().catch(console.error);
