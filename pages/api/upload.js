import { IncomingForm } from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";

// Optional: ignore self-signed SSL errors for dev HTTPS (if needed)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Formidable Error:", err);
      return res.status(500).json({ error: "Error parsing files" });
    }

    try {
      const formData = new FormData();

      const uploadedFiles = Array.isArray(files.files)
        ? files.files
        : [files.files];

      uploadedFiles.forEach((file) => {
        const fileBuffer = fs.readFileSync(file.filepath);
        const safeFilename = path.basename(file.originalFilename || "upload");
        formData.append("files", fileBuffer, safeFilename);
      });

      const flaskUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL}/upload`;

      console.log("➡️ Sending to Flask:", flaskUrl);

      const flaskResponse = await fetch(flaskUrl, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const text = await flaskResponse.text();
      console.log("⬅️ Flask raw response:", text);

      if (!text.trim()) {
        return res.status(502).json({
          error: "Flask server returned empty response",
          raw: text,
        });
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("❌ JSON parse error:", jsonErr);
        return res.status(500).json({
          error: "Invalid JSON from Flask",
          raw: text,
        });
      }

      if (!flaskResponse.ok) {
        console.error("❌ Flask response not OK:", data);
        throw new Error(data.error || "Flask upload failed");
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("❌ Upload Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
}
