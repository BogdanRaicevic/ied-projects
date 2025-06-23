import fs from "fs";
import path from "path";
import { Migration } from "./models/Migration";
import { mongoDbConnection, mysqlConnection } from "./config";

const migrationsDir = path.join(__dirname, "migrations");

interface MigrationFile {
	timestamp: number;
	name: string;
	up: () => Promise<void>;
}

const executeMigration = async (migration: MigrationFile) => {
	console.log(`Executing migration: ${migration.name}`);
	try {
		await migration.up();
		await Migration.create({
			timestamp: migration.timestamp,
			name: migration.name,
		});
	} catch (error) {
		console.error(`Failed to execute migration ${migration.name}:`, error);
		throw error;
	}
};

const loadMigrations = (): MigrationFile[] => {
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
	const mongoConnection = await mongoDbConnection();

	try {
		const migrations = loadMigrations();
		const executedMigrations = await Migration.find().sort({ timestamp: 1 });
		const executedTimestamps = executedMigrations.map((m) => m.timestamp);

		for (const migration of migrations) {
			if (!executedTimestamps.includes(migration.timestamp)) {
				await executeMigration(migration);
			}
		}

		console.log("All migrations executed successfully.");
	} catch (error) {
		console.error("Error running migrations:", error);
	} finally {
		mongoConnection.close();
	}
};

runMigrations().catch(console.error);
