import { CronJob } from "encore.dev/cron";
import { cleanupExpired } from "./cleanup_expired";

// Run cleanup every 6 hours
const cleanupJob = new CronJob("cleanup-expired", {
  title: "Cleanup expired shares",
  schedule: "0 */6 * * *", // Every 6 hours
  endpoint: cleanupExpired,
});
