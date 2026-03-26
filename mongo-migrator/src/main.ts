import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Connection } from "mongoose";
import { mongoDbConnection } from "./config";
import { Migration } from "./models/Migration";

const currentDir = import.meta.dirname;
const migrationsDir = path.join(currentDir, "migrations");

interface MigrationFile {
  timestamp: number;
  name: string;
  up: (db: Connection) => Promise<void>;
}

const executeMigration = async (migration: MigrationFile, db: Connection) => {
  console.log(`[MIGRATION] ==> Executing: ${migration.name}`);
  try {
    await migration.up(db);
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

const loadMigrations = async (): Promise<MigrationFile[]> => {
  console.log(`[MIGRATOR] Scanning for migration files in: ${migrationsDir}`);
  const files = fs.readdirSync(migrationsDir);

  const migrationPromises = files
    .filter((file) => file.endsWith(".ts"))
    .map(async (file) => {
      const [timestamp, ...nameParts] = file.split("_");
      const name = nameParts.join("_").replace(".ts", "");
      const filePath = path.join(migrationsDir, file);
      const module = await import(pathToFileURL(filePath).href);

      return {
        timestamp: parseInt(timestamp!, 10),
        name,
        up: module.up,
      };
    });

  const migrations = await Promise.all(migrationPromises);
  return migrations.sort((a, b) => a.timestamp - b.timestamp);
};

const runMigrations = async () => {
  let mongoConnection: Connection | null = null;
  try {
    mongoConnection = await mongoDbConnection();
    console.log(
      `[MIGRATOR] Successfully connected to database: ${mongoConnection.name} at ${mongoConnection.host}:${mongoConnection.port}`,
    );
    const migrations = await loadMigrations();
    const executedMigrations = await Migration.find().sort({ timestamp: 1 });
    const executedTimestamps = executedMigrations.map((m) => m.timestamp);

    for (const migration of migrations) {
      if (!executedTimestamps.includes(migration.timestamp)) {
        await executeMigration(migration, mongoConnection);
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
