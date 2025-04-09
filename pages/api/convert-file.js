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

    const response = await fetch("http://23.94.202.56:5000/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await response.json();

    if (!response.ok || !data.pesUrl) {
      return new Response(JSON.stringify({ error: "Conversion failed" }), { status: 500 });
    }

    return new Response(JSON.stringify({ pesUrl: data.pesUrl }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Conversion failed", details: err.message }), {
      status: 500,
    });
  }
}