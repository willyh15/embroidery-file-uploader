// lib/uploadFileWithAxios.js
import axios from "axios";

export async function uploadFileWithAxios({
  file,
  onProgress = () => {},
  username = "guest",
}) {
  const formData = new FormData();
  formData.append("files", file);

  const ext = file.name.split(".").pop().toLowerCase();
  const allowed = ["png", "jpg", "jpeg", "webp", "pes", "dst"];
  if (!allowed.includes(ext)) {
    throw new Error(`File type .${ext} not allowed`);
  }

  const response = await axios.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percent);
    },
  });

  return response.data?.urls?.[0]?.url;
}