// src/config/redis.config.mjs

import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password:
    process.env.REDIS_PASSWORD || "bDH2DjmLqwl2QJZOvkhyDZz3GSiqO7qV",
  socket: {
    host:
      process.env.REDIS_HOST ||
      "redis-13833.crce178.ap-east-1-1.ec2.redns.redis-cloud.com",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 13833,
  },
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

async function initRedis() {
  try {
    await client.connect();
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
}

// gọi hàm để connect khi module được import
initRedis();

export default client;
