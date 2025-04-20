export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return new Response(JSON.stringify({ error: "Missing taskId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const flaskBase = process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org";
    const statusUrl = `${flaskBase}/status/${taskId}`;

    const res = await fetch(statusUrl);
    const text = await res.text();

    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "Empty response from Flask" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON from Flask", raw: text }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Progress API Error]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}