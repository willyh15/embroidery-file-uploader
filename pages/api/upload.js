import { put } from "@vercel/blob";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";

export const config = {
  runtime: "edge",
};

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
      });
    }

    const token = await getToken({ req });
    const username = token?.username || "guest";

    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      console.log("No files received in formData");
      return new Response(JSON.stringify({ error: "No files uploaded" }), {
        status: 400,
      });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const originalName = file.name || "file";
      const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();
      const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pes", ".dst"];

      if (!allowedExtensions.includes(ext)) {
        return new Response(
          JSON.stringify({ error: `File type ${ext} not allowed` }),
          { status: 400 }
        );
      }

      const folder = ext === ".pes" || ext === ".dst" ? "embroidery" : "images";
      const uuid = uuidv4();
      const blobName = `${username}/${folder}/${uuid}${ext}`;

      const blob = await put(blobName, file, {
        access: "public",
        token: BLOB_TOKEN, // Required for Edge runtime
      });

      uploadedFiles.push({ url: blob.url });

      if (process.env.NODE_ENV === "development") {
        console.log("Uploaded to Vercel Blob:", blobName);
      }
    }

    return new Response(JSON.stringify({ urls: uploadedFiles }), { status: 200 });

  } catch (err) {
    console.error("Edge Upload Error:", err);
    return new Response(
      JSON.stringify({ error: "Upload failed", details: err.message }),
      { status: 500 }
    );
  }
}