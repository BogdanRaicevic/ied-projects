import { CronJob } from "cron";
import runBackup from "./backupToS3";
import { env } from "../utils/envVariables";

const job = new CronJob(
	"0 22 * * *", // once a day at 22:00
	async () => {
		console.log("Running backup job...");
		if (env.aws.shouldBackup) {
			await runBackup();
		}
	},
	null, // onComplete function (optional)
	true, // Auto-start the job
	"UTC", // Timezone (optional, change as needed)
);

job.start();
