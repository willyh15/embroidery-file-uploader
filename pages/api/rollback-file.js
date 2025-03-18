import { Redis } from "@upstash/redis";

// Instantiate your Upstash Redis client using your environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,  // e.g., "https://usw1-your-instance.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN, // your token here
});

export default async function handler(req, res) {
  const { fileUrl, version } = req.body;

  if (!fileUrl || !version) {
    return res.status(400).json({ error: "Missing file URL or version" });
  }

  try {
    // Retrieve the list of versions stored in Redis under the key "versions:<fileUrl>"
    const versions = await redis.lrange(`versions:${fileUrl}`, 0, -1);
    
    // Find the version that matches the provided version number
    const selectedVersion = versions.find((v) => {
      try {
        return JSON.parse(v).version === version;
      } catch (e) {
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
