import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || "bDH2DjmLqwl2QJZOvkhyDZz3GSiqO7qV",
  socket: {
    host:
      process.env.REDIS_HOST ||
      "redis-13833.crce178.ap-east-1-1.ec2.redns.redis-cloud.com",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 13833,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();
