import {redis} from "../config/redis";

export async function cacheJob(jobId: string, data: any) {
  if (!redis) return;
  await redis.set(`job:${jobId}`, JSON.stringify(data), "EX", 300);
}

export async function getCachedJob(jobId: string) {
  if (!redis) return null;
  const data = await redis.get(`job:${jobId}`);

  return data ? JSON.parse(data) : null;
}