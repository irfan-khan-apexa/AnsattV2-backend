import {redis} from "../config/redis";

export async function cacheJob(jobId: string, data: any) {
  await redis.set(`job:${jobId}`, JSON.stringify(data), "EX", 300);
}

export async function getCachedJob(jobId: string) {
  const data = await redis.get(`job:${jobId}`);

  return data ? JSON.parse(data) : null;
}