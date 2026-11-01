import { execFile } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "../utils/envVariables";
import { __dirname } from "../utils/path";

const BACKUP_DIR = path.join(__dirname, "backup");

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

const getBackupFilename = () => `backup-${getCurrentDate()}.gz`;

const backupMongoDB = async () => {
  const fileName = getBackupFilename();
  const filePath = path.join(BACKUP_DIR, fileName);

  return new Promise<{ fileName: string; filePath: string }>(
    (resolve, reject) => {
      // No shell, and never log the URI: it contains credentials.
      execFile(
        "mongodump",
        [`--uri=${env.mongo.uri}`, `--archive=${filePath}`, "--gzip"],
        (error, _stdout, stderr) => {
          if (error) {
            console.error(
              `[${new Date().toISOString()}] Backup Creation Failed:`,
            );
            console.error(
              `stderr: ${stderr.replaceAll(env.mongo.uri, "<MONGO_URI>")}`,
            );
            // error.message embeds the full command line, URI included.
            return reject(new Error(`mongodump exited with ${error.code}`));
          }
          console.log(
            `[${new Date().toISOString()}] Backup created successfully`,
          );
          resolve({ fileName, filePath });
        },
      );
    },
  );
};

const uploadToS3 = async (fileName: string, filePath: string) => {
  const { region, bucketName, accessKeyId, secretAccessKey } = env.aws;
  if (!bucketName || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS bucket name or credentials are not defined in env.");
  }
  const s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  const fileStream = createReadStream(filePath);

  const params = {
    Bucket: bucketName,
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
    mkdirSync(BACKUP_DIR, { recursive: true });
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
