import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fileUrl, status, stage } = req.body;

  if (!fileUrl || !status || !stage) {
    return res.status(400).json({ error: 'Missing fileUrl, status, or stage' });
  }

  try {
    const timestamp = new Date().toISOString();
    const statusEntry = { status, stage, timestamp };

    // Store status entry as a JSON string
    await redis.set(`status:${fileUrl}`, JSON.stringify(statusEntry));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to set Redis status:', err);
    res.status(500).json({ error: 'Redis status update failed' });
  }
}