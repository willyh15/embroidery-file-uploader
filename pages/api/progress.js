// pages/api/progress.js
import fetch from "node-fetch";

export const config = {
  runtime: "edge", // use Vercel Edge Runtime for faster polling
};

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return new Response(
        JSON.stringify({ error: "Missing taskId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const flaskStatusUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/status/${taskId}`;

    const flaskResponse = await fetch(flaskStatusUrl, {
      method: "GET",
    });

    const text = await flaskResponse.text();
    if (!text.trim()) {
      return new Response(
        JSON.stringify({ error: "Empty response from Flask server" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("[Progress API] Failed to parse Flask response:", text);
      return new Response(
        JSON.stringify({ error: "Invalid JSON from Flask", raw: text }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: flaskResponse.ok ? 200 : 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Progress API] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}