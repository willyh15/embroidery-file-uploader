export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { jobId } = req.query;
  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  const response = await fetch(`https://your-render-api.com/conversion-status/${jobId}`);
  const data = await response.json();

  return res.status(200).json(data);
};