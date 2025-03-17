// pages/api/comments.js (for example)
import { Redis } from "@upstash/redis";

// Create your Upstash Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,    // rename your env variable as you prefer
  token: process.env.KV_REST_API_TOKEN,
});

// For demonstration, referencing a custom rateLimit() you might already have:
import { rateLimit } from "../../utils/rateLimit"; // or wherever it's defined

export default async function handler(req, res) {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "unknown-ip";

  // Example of a rate-limit check: 5 requests per 60 seconds
  if (!(await rateLimit(ip, 5, 60))) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  if (req.method === "POST") {
    const { fileUrl, comment } = req.body;
    if (!fileUrl || !comment) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Instead of kv.append(), we store each comment in a list
    // “rpush” pushes to the end of the list
    await redis.rpush(`comments:${fileUrl}`, comment);

    return res.status(200).json({ message: "Comment added successfully" });
  }

  if (req.method === "GET") {
    const { fileUrl } = req.query;
    if (!fileUrl) {
      return res.status(400).json({ error: "Missing fileUrl parameter" });
    }

    // Retrieve all comments from the list
    const rawComments = await redis.lrange(`comments:${fileUrl}`, 0, -1);
    // If you stored plain strings, no parse needed:
    // const comments = rawComments;
    // If you stored JSON, you might parse each item:
    // const comments = rawComments.map((c) => JSON.parse(c));

    return res.status(200).json({ comments: rawComments });
  }

  res.status(405).json({ error: "Method not allowed" });
}