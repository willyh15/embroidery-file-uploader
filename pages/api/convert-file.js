export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fileUrl } = req.body;

    const response = await fetch("https://23.94.202.56:5000/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await response.json();

    if (!response.ok || !data.task_id) {
      throw new Error(data.error || "Conversion initiation failed");
    }

    return res.status(202).json({ taskId: data.task_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
