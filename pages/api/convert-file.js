export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { fileUrl } = await req.json();
    const res = await fetch("http://23.94.202.56:5000/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await res.json();

    if (!res.ok || !data.task_id) {
      throw new Error(data.error || "Conversion initiation failed");
    }

    return new Response(JSON.stringify({ taskId: data.task_id }), { status: 202 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}