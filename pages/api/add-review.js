// pages/api/add-review.js (for example)
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// 1. Instantiate your Upstash Redis client using env vars
const redis = new Redis({
  url: process.env.KV_REST_API_URL,     // from your Upstash Dashboard
  token: process.env.KV_REST_API_TOKEN, // from your Upstash Dashboard
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, rating, review } = req.body;

  if (!fileUrl || !rating || !review) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // 2. Use 'redis.lpush(...)' to prepend a review to the list
  await redis.lpush(`reviews:${fileUrl}`, JSON.stringify({
    user: session.user.username,
    rating,
    review,
    timestamp: new Date().toISOString(),
  }));

  return res.status(200).json({ message: "Review added successfully" });
}