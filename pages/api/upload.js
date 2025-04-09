export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files.length) {
      return new Response(JSON.stringify({ error: "No files uploaded" }), { status: 400 });
    }

    const flaskFormData = new FormData();
    files.forEach(file => flaskFormData.append("files", file));

    const flaskResponse = await fetch("http://23.94.202.56:5000/upload", {
      method: "POST",
      body: flaskFormData,
    });

    const data = await flaskResponse.json();

    if (!flaskResponse.ok) throw new Error(data.error || "Flask upload failed");

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}