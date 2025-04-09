import { put } from "@vercel/blob";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";

export const config = {
  runtime: "edge",
};

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
    });
  }

  const token = await getToken({ req });
  const username = token?.username || token?.email || "guest";

  const formData = await req.formData();
  const files = formData.getAll("files");

  if (!files || files.length === 0) {
    return new Response(JSON.stringify({ error: "No files uploaded" }), {
      status: 400,
    });
  }

  const allowed = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
  const uploadedFiles = [];

  for (const file of files) {
    const originalName = file.name || "file";
    const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();

    if (!allowed.includes(ext)) {
      return new Response(
        JSON.stringify({ error: `File type ${ext} not allowed` }),
        { status: 400 }
      );
    }

    const uuid = uuidv4();
    const blobName = `guest/images/${uuid}-${originalName}`;

    const buffer = await file.arrayBuffer();
    const blob = await put(blobName, new Blob([buffer]), {
      access: "public",
      token: BLOB_TOKEN,
    });

    uploadedFiles.push({ url: blob.url });
  }

  return new Response(JSON.stringify({ urls: uploadedFiles }), { status: 200 });
}