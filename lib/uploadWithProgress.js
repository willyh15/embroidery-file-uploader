// lib/uploadWithProgress.js
import axios from "axios";

export async function uploadFilesWithProgress({
  files,
  onProgress,
  onFileProgress,
  onComplete,
  onError,
}) {
  try {
    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("files", file);

      const config = {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(percent);
          onFileProgress?.(file.name, percent);
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await axios.post("/api/upload", formData, config);

      if (res.status !== 200 || !res.data?.urls?.[0]?.url) {
        throw new Error("Upload failed for " + file.name);
      }

      uploaded.push({
        url: res.data.urls[0].url,
        name: file.name,
      });
    }

    onComplete?.(uploaded);
  } catch (err) {
    console.error("uploadFilesWithProgress error:", err);
    onError?.(err);
  }
}