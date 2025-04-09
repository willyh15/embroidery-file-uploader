export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "No files uploaded" }), { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      uploadedFiles.push({
        name: file.name,
        url,
      });
    }

    return new Response(JSON.stringify({ urls: uploadedFiles }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upload failed", details: err.message }), {
      status: 500,
    });
  }
}