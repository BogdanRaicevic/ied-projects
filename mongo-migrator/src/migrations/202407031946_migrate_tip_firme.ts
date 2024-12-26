import { RowDataPacket } from 'mysql2/promise';
import { mongoDbConnection, mysqlConnection } from '../config';

export const up = async () => {
  const monogDb = await mongoDbConnection();
  const mysqlDb = await mysqlConnection();
  const mongoCollectionName = 'tipovi_firmi';

  try {
    // Check if the collection exists
    const collections = await monogDb.listCollections();
    const collectionNames = collections.map((col) => col.name);

    if (!collectionNames.includes(mongoCollectionName)) {
      await (await mongoDbConnection()).createCollection(mongoCollectionName);
      console.log(`Collection '${mongoCollectionName}' created`);
    }

    const mongoCollection = monogDb.collection(mongoCollectionName);

    // Fetch data from MySQL
    const [rows] = await mysqlDb.execute<RowDataPacket[]>(
      `SELECT DISTINCT tip_firme FROM firma WHERE tip_firme IS NOT NULL  AND tip_firme != ''`
    );
    console.log(`Fetched ${rows.length} rows from MySQL`);

    // Insert data into MongoDB
    const result = await mongoCollection.insertMany(rows);
    console.log(`Inserted ${result.insertedCount} documents into MongoDB`);
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};
