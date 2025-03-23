// pages/api/assign-role.js
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { username, roleName } = req.body;
  if (!username || !roleName) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    await redis.hset(`user:${username}`, { role: roleName });
    return res.status(200).json({ message: `Role "${roleName}" assigned to "${username}"` });
  } catch (err) {
    console.error("Error assigning role:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}