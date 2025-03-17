import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// 1. Initialize Upstash Redis client with your environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,     // e.g. "https://xxxxxx.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN  // e.g. "xxxxxx"
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 2. Fetch the subscription value from Upstash Redis
    //    If you stored the subscription as a JSON string, you may need to parse it
    const subscriptionData = await redis.get(`subscription:${session.user.email}`);

    // If subscriptionData is a JSON string, parse it:
    // const subscription = subscriptionData ? JSON.parse(subscriptionData) : null;
    // But if you stored it as a simple boolean or object natively, parse usage may vary.

    // 3. Return whether or not the subscription is active
    // Example if you stored it as { active: true/false }
    const isPremium = subscriptionData?.active || false;

    return res.status(200).json({ isPremium });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}