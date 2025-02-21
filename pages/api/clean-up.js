import { list, del } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { blobs } = await list();
    const now = new Date();

    for (const blob of blobs) {
      const expiryDate = new Date(blob.expiryDate);
      if (expiryDate < now) {
        await del(blob.url);
      }
    }

    return res.status(200).json({ message: "Expired files deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to clean up files", details: error.message });
  }
}
