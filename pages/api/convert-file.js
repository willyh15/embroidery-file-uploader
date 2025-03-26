// pages/api/convert-file.js
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
    });
  }

  const token = await getToken({ req });
  const username = token?.username || "guest";

  try {
    const { fileUrl, format = "pes" } = await req.json();

    // Simulate conversion output (replace with CLI later)
    const uuid = uuidv4();
    const blobKey = `${username}/embroidery/converted-${uuid}.${format}`;
    const convertedUrl = `https://blob.vercel-storage.com/${blobKey}`;
    const expiryDate = new Date(Date.now() + 30 * 86400000).toISOString();

    console.log(`Simulated conversion for ${fileUrl} -> ${convertedUrl}`);

    return new Response(JSON.stringify({ convertedUrl, expiryDate }), {
      status: 200,
    });
  } catch (err) {
    console.error("Conversion error:", err);
    return new Response(JSON.stringify({ error: "Conversion failed" }), {
      status: 500,
    });
  }
}