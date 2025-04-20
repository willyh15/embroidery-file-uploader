// pages/api/upload.js
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("[Upload API] Formidable parse error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    try {
      const formData = new FormData();
      const fileArray = Array.isArray(files.files) ? files.files : [files.files];

      for (const file of fileArray) {
        const buffer = fs.readFileSync(file.filepath);
        const safeFilename = path.basename(file.originalFilename || "uploaded_file");
        formData.append("files", buffer, safeFilename);
      }

      const flaskUploadEndpoint = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/upload`;

      const flaskResponse = await fetch(flaskUploadEndpoint, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const text = await flaskResponse.text();
      if (!text.trim()) {
        return res.status(502).json({ error: "Empty response from Flask server" });
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("[Upload API] Failed to parse Flask response:", text);
        return res.status(500).json({ error: "Invalid JSON from Flask", raw: text });
      }

      if (!flaskResponse.ok) {
        console.error("[Upload API] Flask returned error:", data);
        return res.status(500).json({ error: "Flask upload failed", raw: data });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("[Upload API] Unexpected error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
}