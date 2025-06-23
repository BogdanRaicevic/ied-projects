import path from "node:path";
import { env } from "../utils/envVariables";
import { createReadStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { exec } from "node:child_process";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { __dirname } from "../utils/path";

const BUCKET_NAME = env.aws.bucketName;
if (!BUCKET_NAME) {
  throw new Error("AWS bucket name is not defined in environment variables.");
}
const MONGO_URI = env.mongo.uri;
const BACKUP_DIR = path.join(__dirname, "backup");

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

const getBackupFilename = () => `backup-${getCurrentDate()}.gz`;

if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create an S3 instance
if (!env.aws.accessKeyId || !env.aws.secretAccessKey) {
  throw new Error("AWS credentials are not defined in environment variables.");
}

const s3Client = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId as string,
    secretAccessKey: env.aws.secretAccessKey as string,
  },
});

const backupMongoDB = async () => {
  const fileName = getBackupFilename();
  const filePath = path.join(BACKUP_DIR, fileName);

  return new Promise<{ fileName: string; filePath: string }>(
    (resolve, reject) => {
      const command = `mongodump --uri=${MONGO_URI} --archive=${filePath} --gzip`;

      exec(command, (error, _stdout, stderr) => {
        if (error) {
          console.error(
            `[${new Date().toISOString()}] Backup Creation Failed:`,
          );
          console.error(`Command: ${command}`);
          console.error(`Error: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          return reject(error);
        }
        console.log(
          `[${new Date().toISOString()}] Backup created successfully`,
        );
        resolve({ fileName, filePath });
      });
    },
  );
};

const uploadToS3 = async (fileName: string, filePath: string) => {
  const fileStream = createReadStream(filePath);

  const params = {
    Bucket: BUCKET_NAME,
    Key: `backups/${fileName}`,
    Body: fileStream,
    ContentType: "application/gzip",
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params,
    });

    await upload.done();
    console.log(
      `[${new Date().toISOString()}] Upload to S3 completed: ${fileName}`,
    );
    unlinkSync(filePath); // Delete backup after upload
  } catch (error) {
    console.error(`[${new Date().toISOString()}] S3 Upload Failed:`);
    console.error(`File: ${fileName}`);
    console.error(`Error: ${error}`);
    throw error;
  }
};

const runBackup = async () => {
  try {
    const { fileName, filePath } = await backupMongoDB();
    await uploadToS3(fileName, filePath);
    console.log(
      `[${new Date().toISOString()}] Backup process completed successfully`,
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Backup process failed:`);
    console.error(error);
    // Ensure the temporary file is cleaned up even if upload fails
    const filePath = path.join(BACKUP_DIR, getBackupFilename());
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    // Rethrow the error so PM2 can catch it
    throw error;
  }
};

// ESM way to check if the file is being run directly
const isMainModule = () => {
  const mainModule = process.argv[1];
  const currentModule = __dirname;
  return mainModule === currentModule;
};

if (isMainModule()) {
  runBackup();
}

export default runBackup;
