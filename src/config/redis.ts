// import Redis from "ioredis";
// import { Queue } from "bullmq";

// export const connection = {
//   host: "127.0.0.1",
//   port: 6379,
// };

// // optional client if you need redis commands elsewhere
// export const redis = new Redis(connection);

// redis.on("connect", () => {
//   console.log("Redis Connected");
// });

// redis.on("error", (err) => {
//   console.error("Redis Error:", err);
// });

// // BullMQ queue
// export const resumeQueue = new Queue("resume-processing", {
//   connection,
// });


//for production
import Redis from "ioredis";
import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL as string;

export let redis: Redis | null = null;
export let resumeQueue: Queue | null = null;

if (!redisUrl) {
  console.warn("⚠️ REDIS_URL is not defined. Redis features will be disabled.");
} else {
  // Redis client (for caching)
  redis = new Redis(redisUrl);

  redis.on("connect", () => {
    console.log("✅ Redis Connected");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis Error:", err);
  });

  // BullMQ queue
  resumeQueue = new Queue("resume-processing", {
    connection: {
      url: redisUrl,
    },
  });
}