// lib/uploadWithProgress.js
import axios from "axios";

export async function uploadFilesWithProgress({
  files,
  username,
  onProgress = () => {},
  onSuccess = () => {},
  onError = () => {},
}) {
  const uploadedFiles = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("files", file);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(file, percent);
        },
      });

      if (response.status === 200) {
        const blobUrl = response.data.urls[0]?.url;
        uploadedFiles.push({ ...file, url: blobUrl });
        onSuccess(file, blobUrl);
      } else {
        onError(file, response.data?.error || "Unknown error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      onError(file, err.message);
    }
  }

  return uploadedFiles;
}