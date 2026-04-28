import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run activity bot every 40 seconds
crons.interval(
  "run activity bot",
  { seconds: 40 },
  internal.chat.runActivityBot,
  {}
);

crons.interval(
  "weekly cashback",
  { hours: 168 }, // 1 week
  internal.users.internalApplyWeeklyCashback,
  {}
);

export default crons;
