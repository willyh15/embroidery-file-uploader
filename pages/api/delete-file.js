import { del } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  try {
    await del(fileUrl); // Delete the file from Vercel Blob Storage
    return res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete file", details: error.message });
  }
}