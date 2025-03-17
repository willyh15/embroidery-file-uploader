// pages/api/assign-role.js (for example)
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Create your Upstash Redis client once with environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  // Only an admin can assign roles
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { username, roleName } = req.body;

  if (!username || !roleName) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Replace `kv.hset(...)` with `redis.hset(...)`
  // Using a hash key `user:${username}`, setting the field "role" 
  // to roleName
  await redis.hset(`user:${username}`, { role: roleName });

  return res.status(200).json({ message: `Role assigned to ${username}` });
}