export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "Missing fileUrl" }), { status: 400 });
    }

    // Simulate processing and return a converted PES URL (mock)
    const pesUrl = `https://your-flask-server.com/downloads/converted.pes`;

    return new Response(JSON.stringify({ pesUrl }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Conversion failed", details: err.message }), {
      status: 500,
    });
  }
}