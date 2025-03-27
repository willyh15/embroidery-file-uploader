import { v4 as uuidv4 } from "uuid";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "Missing fileUrl" }), { status: 400 });
    }

    const flaskRes = await fetch("http://23.94.202.56:5000/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await flaskRes.json();
    if (!flaskRes.ok) {
      return new Response(JSON.stringify({ error: data?.error || "Conversion failed" }), { status: 500 });
    }

    const uploads = {};
    for (const [ext, hex] of Object.entries({ dst: data.dst, pes: data.pes })) {
      if (!hex) continue;
      const filename = `${uuidv4()}.${ext}`;
      const uploadRes = await fetch(`${process.env.NEXTAUTH_URL}/api/upload-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: `data:application/octet-stream;base64,${Buffer.from(hex, "hex").toString("base64")}`,
          filename,
        }),
      });

      const uploadData = await uploadRes.json();
      if (uploadRes.ok && uploadData.url) {
        uploads[ext] = uploadData.url;
      }
    }

    return new Response(
      JSON.stringify({
        convertedDst: uploads.dst || null,
        convertedPes: uploads.pes || null,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Conversion error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}