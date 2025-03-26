// /pages/api/upload.js
import { put } from "@vercel/blob";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
    });
  }

  const token = await getToken({ req });
  const username = token?.username || "guest";
  const expiryDays = 30;
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pes", ".dst"];

  const formData = await req.formData();
  const files = formData.getAll("files");

  if (!files || files.length === 0) {
    return new Response(JSON.stringify({ error: "No files uploaded" }), {
      status: 400,
    });
  }

  const uploadedFiles = [];

  try {
    for (const file of files) {
      const originalName = file.name || "file";
      const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return new Response(
          JSON.stringify({ error: `File type ${ext} not allowed` }),
          { status: 400 }
        );
      }

      const isEmbroidery = ext === ".pes" || ext === ".dst";
      const folder = isEmbroidery ? "embroidery" : "images";

      const uuid = uuidv4();
      const blobName = `${username}/${folder}/${uuid}${ext}`;

      const blob = await put(blobName, file, { access: "public" });

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      uploadedFiles.push({ url: blob.url, expiryDate });

      if (process.env.NODE_ENV === "development") {
        console.log("Uploaded:", blobName);
      }
    }

    return new Response(JSON.stringify({ urls: uploadedFiles }), {
      status: 200,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(
      JSON.stringify({ error: "Upload failed", details: err.message }),
      { status: 500 }
    );
  }
}