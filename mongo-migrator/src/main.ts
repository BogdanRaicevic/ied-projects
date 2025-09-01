import fs from "node:fs";
import path from "node:path";
import type { Connection } from "mongoose";
import { mongoDbConnection } from "./config";
import { Migration } from "./models/Migration";

const migrationsDir = path.join(__dirname, "migrations");

interface MigrationFile {
  timestamp: number;
  name: string;
  up: () => Promise<void>;
}

const executeMigration = async (migration: MigrationFile) => {
  console.log(`[MIGRATION] ==> Executing: ${migration.name}`);
  try {
    await migration.up();
    await Migration.create({
      timestamp: migration.timestamp,
      name: migration.name,
    });
    console.log(`[MIGRATION] ==> SUCCESS: ${migration.name}`);
  } catch (error) {
    console.error(
      `[MIGRATION] ==> FAILED to execute migration ${migration.name}:`,
      error,
    );
    throw error;
  }
};

const loadMigrations = (): MigrationFile[] => {
  console.log(`[MIGRATOR] Scanning for migration files in: ${migrationsDir}`);
  const files = fs.readdirSync(migrationsDir);
  return files
    .filter((file) => file.endsWith(".ts"))
    .map((file) => {
      const [timestamp, ...nameParts] = file.split("_");
      const name = nameParts.join("_").replace(".ts", "");
      return {
        timestamp: parseInt(timestamp, 10),
        name,
        up: require(path.join(migrationsDir, file)).up,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
};

const runMigrations = async () => {
  let mongoConnection: Connection | null = null;
  try {
    mongoConnection = await mongoDbConnection();
    console.log(
      `[MIGRATOR] Successfully connected to database: ${mongoConnection.name} at ${mongoConnection.host}:${mongoConnection.port}`,
    );
    const migrations = loadMigrations();
    const executedMigrations = await Migration.find().sort({ timestamp: 1 });
    const executedTimestamps = executedMigrations.map((m) => m.timestamp);

    for (const migration of migrations) {
      if (!executedTimestamps.includes(migration.timestamp)) {
        await executeMigration(migration);
      }
    }

    console.log("[MIGRATOR] All migrations executed successfully.");
  } catch (error) {
    console.error(
      "[MIGRATOR] A critical error occurred during the migration process:",
      error,
    );
  } finally {
    if (mongoConnection) {
      console.log("[MIGRATOR] Closing database connection.");
      await mongoConnection.close();
    }
  }
};

runMigrations().catch(console.error);
