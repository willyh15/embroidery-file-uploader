import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using updated env vars
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const { fileUrl, version } = req.body;

  if (!fileUrl || !version) {
    return res.status(400).json({ error: "Missing file URL or version" });
  }

  try {
    const versions = await redis.lrange(`versions:${fileUrl}`, 0, -1);

    const selectedVersion = versions.find((v) => {
      try {
        return JSON.parse(v).version === version;
      } catch {
        return false;
      }
    });

    if (!selectedVersion) {
      return res.status(404).json({ error: "Version not found" });
    }

    const parsedVersion = JSON.parse(selectedVersion);
    return res.status(200).json({ restoredFile: parsedVersion.fileUrl });
  } catch (error) {
    console.error("Error retrieving file version:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}