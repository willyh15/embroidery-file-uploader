// pages/api/blob-upload-url.js
import { createUploadUrl } from "@vercel/blob";

// DEBUG: Check if token is actually being injected
console.log("BLOB_READ_WRITE_TOKEN:", process.env.BLOB_READ_WRITE_TOKEN);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: "Missing filename" });
    }

    const { url, blob } = await createUploadUrl({
      filename,
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ url, blob });
  } catch (err) {
    console.error("Failed to generate upload URL:", err?.message || err);
    return res.status(500).json({ error: "Internal server error" });
  }
}