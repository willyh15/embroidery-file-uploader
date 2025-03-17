import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// 1. Initialize Upstash Redis client with your environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,     // e.g. "https://xxxxxx.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN,   // e.g. "xxxxxx"
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 2. Fetch the subscription value from Upstash Redis
    const subscriptionData = await redis.get(`subscription:${session.user.email}`);

    // Parse the subscription data if stored as JSON
    const subscription = subscriptionData ? JSON.parse(subscriptionData) : null;

    // 3. Return whether the subscription is active
    const isPremium = subscription?.active || false;
    return res.status(200).json({ isPremium });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}