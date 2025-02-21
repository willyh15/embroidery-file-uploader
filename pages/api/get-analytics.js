export default async function handler(req, res) {
  try {
    const allKeys = await kv.keys("storage:*");
    const analytics = [];

    for (const key of allKeys) {
      const user = key.split(":")[1];
      const storageUsed = await kv.get(key);
      analytics.push({ user, storageUsed });
    }

    return res.status(200).json({ analytics });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
}
