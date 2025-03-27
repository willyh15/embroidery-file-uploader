import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    const [progress, status] = await Promise.all([
      redis.get(`progress:${fileUrl}`),
      redis.get(`status:${fileUrl}`),
    ]);

    res.status(200).json({
      progress: Number(progress) || 0,
      status: status || "Pending",
    });
  } catch (err) {
    console.error("Redis polling error:", err);
    res.status(500).json({ error: "Failed to fetch progress or status" });
  }
}