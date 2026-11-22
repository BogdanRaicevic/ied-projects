import * as Sentry from "@sentry/node";
import { CronJob } from "cron";
import { syncListmonk } from "../services/listmonk.service";
import { env } from "../utils/envVariables";
import runBackup from "./backupToS3";

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

new CronJob(
  "0 2 * * *", // nightly at 02:00
  async () => {
    if (!env.listmonk.url) {
      console.log("Listmonk sync skipped - LISTMONK_URL not set");
      return;
    }
    try {
      const { failures, ...counts } = await syncListmonk();
      console.log("Listmonk sync done:", counts, failures.slice(0, 20));
    } catch (error) {
      Sentry.captureException(error);
      console.error("Listmonk sync failed:", error);
    }
  },
  null,
  true,
  "UTC",
);
