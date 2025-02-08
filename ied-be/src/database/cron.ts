import { CronJob } from "cron";
import runBackup from "./backupToS3";

const job = new CronJob(
	"0 22 * * *", // once a day at 22:00
	async () => {
		console.log("Running backup job...");
		await runBackup();
	},
	null, // onComplete function (optional)
	true, // Auto-start the job
	"UTC", // Timezone (optional, change as needed)
);

job.start();
