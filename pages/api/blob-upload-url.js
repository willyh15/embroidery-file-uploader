import { createUploadUrl } from "@vercel/blob";

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
      // Optional: add tags or metadata here
    });

    return res.status(200).json({ url, blob });
  } catch (err) {
    console.error("Failed to generate upload URL:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}