import path from "node:path";
import { env } from "../utils/envVariables";
import { createReadStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { exec } from "node:child_process";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const BUCKET_NAME = env.aws.bucketName;
if (!BUCKET_NAME) {
  throw new Error("AWS bucket name is not defined in environment variables.");
}
const MONGO_URI = env.mongo.uri;
const BACKUP_DIR = path.join(__dirname, "backup");
const FILE_NAME = `backup-${new Date().toISOString().split("T")[0]}.gz`;
const FILE_PATH = path.join(BACKUP_DIR, FILE_NAME);

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
  return new Promise<void>((resolve, reject) => {
    const command = `mongodump --uri=${MONGO_URI} --archive=${FILE_PATH} --gzip`;

    exec(command, (error, _stdout, stderr) => {
      if (error) {
        console.error(`Error creating backup: ${stderr}`);
        return reject(error);
      }
      console.log("Backup created successfully.");
      resolve();
    });
  });
};

const uploadToS3 = async () => {
  const fileStream = createReadStream(FILE_PATH);

  const params = {
    Bucket: BUCKET_NAME,
    Key: `backups/${FILE_NAME}`,
    Body: fileStream,
    ContentType: "application/gzip",
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params,
    });

    await upload.done();

    unlinkSync(FILE_PATH); // Delete backup after upload
  } catch (error) {
    console.error(`Error uploading to S3: ${error}`);
    throw error;
  }
};

const runBackup = async () => {
  try {
    await backupMongoDB();
    await uploadToS3();
  } catch (error) {
    console.error("Backup process failed: ", error);
  }
};

if (require.main === module) {
  runBackup();
}

export default runBackup;
