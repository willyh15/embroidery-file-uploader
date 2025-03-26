// pages/api/convert-file.js
import { getToken } from "next-auth/jwt";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  const token = await getToken({ req });
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "fileUrl is required" }), { status: 400 });
    }

    // Simulate conversion
    const filename = fileUrl.split("/").pop().split(".")[0];
    const fakePesUrl = `https://vercel-blob.fake/converted/${filename}.pes`;

    // Optional: simulate logging the version (you can POST to /api/upload-file here)
    // await fetch("/api/upload-file", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ fileUrl: fakePesUrl }),
    // });

    return new Response(JSON.stringify({ convertedUrl: fakePesUrl }), { status: 200 });
  } catch (err) {
    console.error("Conversion error:", err);
    return new Response(
      JSON.stringify({ error: "Conversion failed", details: err.message }),
      { status: 500 }
    );
  }
}