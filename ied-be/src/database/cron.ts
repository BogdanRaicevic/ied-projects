import { CronJob } from "cron";
import runBackup from "./backupToS3";
import { env } from "../utils/envVariables";

const job = new CronJob(
  "0 22 * * *", // once a day at 22:00
  async () => {
    console.log(
      `[${new Date().toISOString()}] Starting scheduled backup job...`,
    );
    try {
      if (env.aws.shouldBackup) {
        await runBackup();
      } else {
        console.log("Backup skipped - shouldBackup is false");
      }
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Scheduled backup failed:`,
        error,
      );
    }
  },
  null, // onComplete function (optional)
  true, // Auto-start the job
  "UTC", // Timezone (optional, change as needed)
);

job.start();
