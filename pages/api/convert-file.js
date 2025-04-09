export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
    });
  }

  const { fileUrl } = await req.json();
  if (!fileUrl) {
    return new Response(JSON.stringify({ error: "Missing fileUrl" }), {
      status: 400,
    });
  }

  const response = await fetch("http://23.94.202.56:5000/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });

  const text = await response.text();
  let result;

  try {
    result = JSON.parse(text);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON from Flask" }), {
      status: 500,
    });
  }

  if (!result.pesUrl) {
    return new Response(JSON.stringify({ error: "Conversion did not return output URLs." }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ pesUrl: result.pesUrl }), {
    status: 200,
  });
}