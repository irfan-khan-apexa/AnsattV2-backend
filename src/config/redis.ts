import Redis from "ioredis";
import { Queue } from "bullmq";

export const connection = {
  host: "127.0.0.1",
  port: 6379,
};

// optional client if you need redis commands elsewhere
export const redis = new Redis(connection);

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

// BullMQ queue
export const resumeQueue = new Queue("resume-processing", {
  connection,
});