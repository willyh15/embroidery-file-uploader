import { IncomingForm } from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable Error:", err);
      return res.status(500).json({ error: "Error parsing files" });
    }

    try {
      const formData = new FormData();
      const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];

      uploadedFiles.forEach((file) => {
        const fileBuffer = fs.readFileSync(file.filepath);
        const safeFilename = path.basename(file.originalFilename || "upload");
        formData.append("files", fileBuffer, safeFilename);
      });

      const flaskUploadUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/upload`;

      const flaskResponse = await fetch(flaskUploadUrl, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const text = await flaskResponse.text();
      if (!text.trim()) return res.status(502).json({ error: "Flask server returned empty response" });

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        return res.status(500).json({ error: "Invalid JSON from Flask", details: text });
      }

      if (!flaskResponse.ok) throw new Error(data.error || "Flask upload failed");

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
}
