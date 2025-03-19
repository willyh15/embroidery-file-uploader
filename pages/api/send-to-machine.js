import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Instantiate Upstash Redis client using your environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,      // from your Upstash dashboard
  token: process.env.KV_REST_API_TOKEN,  // from your Upstash dashboard
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const { fileUrl, machineId } = req.body;
  
  if (!fileUrl || !machineId) {
    return res.status(400).json({ error: "File URL and Machine ID are required" });
  }
  
  // Use the Upstash Redis client's lpush method to add the fileUrl to the machine uploads list
  await redis.lpush(`machine-uploads:${machineId}`, fileUrl);
  
  return res.status(200).json({ message: "File sent to embroidery machine" });
}