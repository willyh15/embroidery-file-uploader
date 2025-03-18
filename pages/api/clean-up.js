import { list, del } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Retrieve all blobs
    const { blobs } = await list();
    const now = new Date();

    // Process each blob
    for (const blob of blobs) {
      const expiryDate = new Date(blob.expiryDate);

      // If less than 2 days remain before expiry, send a notification email
      if (expiryDate - now <= 2 * 24 * 60 * 60 * 1000 && expiryDate > now) {
        await fetch("https://your-site.vercel.app/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "user@example.com", // Customize with the recipient's email
            fileUrl: blob.url,
            expiryDate: blob.expiryDate,
          }),
        });
      }

      // If the blob has expired, delete it
      if (expiryDate < now) {
        await del(blob.url);
      }
    }

    return res.status(200).json({ message: "Expired files cleaned, notifications sent." });
  } catch (error) {
    console.error("Error cleaning up files:", error);
    return res.status(500).json({ error: "Failed to clean up files", details: error.message });
  }
}