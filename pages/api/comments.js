// pages/api/comments.js
import { Redis } from "@upstash/redis";
import { rateLimit } from "../../utils/rateLimit"; // Updated import path

// Create your Upstash Redis client (if you need it for other operations)
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "unknown-ip";

  // Use the imported rateLimit function from Upstash
  if (!(await rateLimit(ip, 5, 60))) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  if (req.method === "POST") {
    const { fileUrl, comment } = req.body;
    if (!fileUrl || !comment) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Use rpush to add the comment to a list
    await redis.rpush(`comments:${fileUrl}`, comment);

    return res.status(200).json({ message: "Comment added successfully" });
  }

  if (req.method === "GET") {
    const { fileUrl } = req.query;
    if (!fileUrl) {
      return res.status(400).json({ error: "Missing fileUrl parameter" });
    }

    const rawComments = await redis.lrange(`comments:${fileUrl}`, 0, -1);
    return res.status(200).json({ comments: rawComments });
  }

  res.status(405).json({ error: "Method not allowed" });
}