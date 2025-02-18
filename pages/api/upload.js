import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const file = req.body.file;
  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  try {
    // Upload file to Vercel Blob Storage
    const { url } = await put(file.name, file, { access: "public" });

    return res.status(200).json({ url });
  } catch (error) {
    return res.status(500).json({ error: "Upload failed", details: error.message });
  }
}

const { visibility = "private" } = req.body;
await kv.hset(`file:${url}`, { visibility });