// pages/api/add-review.js
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Instantiate the Upstash Redis client using your environment variables from your Upstash dashboard
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
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

  // Use the Upstash Redis client to push the review into a list
  await redis.lpush(`reviews:${fileUrl}`, JSON.stringify({
    user: session.user.username,
    rating,
    review,
    timestamp: new Date().toISOString(),
  }));

  return res.status(200).json({ message: "Review added successfully" });
}