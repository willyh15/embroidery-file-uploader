export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { fileUrl } = await req.json();
    if (!fileUrl) return new Response(JSON.stringify({ error: "Missing fileUrl" }), { status: 400 });

    const flaskRes = await fetch("http://23.94.202.56:5000/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await flaskRes.json();
    if (!flaskRes.ok) {
      return new Response(JSON.stringify({ error: data?.error || "Conversion failed" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({
      convertedUrl: data.convertedDstUrl || data.convertedPesUrl,
      convertedDst: data.convertedDstUrl,
      convertedPes: data.convertedPesUrl,
    }), { status: 200 });
  } catch (err) {
    console.error("Conversion error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}