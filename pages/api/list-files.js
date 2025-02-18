import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Fetch all uploaded files from Vercel Blob Storage
    const { blobs } = await list();

    return res.status(200).json({ files: blobs.map((blob) => blob.url) });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch files", details: error.message });
  }
}