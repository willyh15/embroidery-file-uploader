// /pages/api/upload.js
import { put } from "@vercel/blob";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import { Redis } from "@upstash/redis";

export const config = {
  runtime: "edge",
};

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BASE_URL = process.env.NEXTAUTH_URL;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const token = await getToken({ req });
    const username = token?.username || token?.email || "guest";

    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "No files uploaded" }), { status: 400 });
    }

    const allowed = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
    const uploadedFiles = [];

    for (const file of files) {
      const name = file.name || "file";
      const ext = name.slice(name.lastIndexOf(".")).toLowerCase();

      if (!allowed.includes(ext)) {
        return new Response(JSON.stringify({ error: `File type ${ext} not allowed` }), {
          status: 400,
        });
      }

      const uuid = uuidv4();
      const folder = ext === ".svg" ? "svgs" : "images";
      const blobName = `${username}/${folder}/${uuid}${ext}`;

      const buffer = await file.arrayBuffer();
      const blob = await put(blobName, new Blob([buffer]), {
        access: "public",
        token: BLOB_TOKEN,
      });

      await redis.set(`visibility:${blob.url}`, "private");
      await redis.set(`owner:${blob.url}`, username);

      uploadedFiles.push({ url: blob.url, name });
    }

    return new Response(JSON.stringify({ urls: uploadedFiles }), { status: 200 });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}