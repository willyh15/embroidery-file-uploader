import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState([]);

  const handleUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(uploadedFiles);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Embroidery File Uploader</h1>
      <input type="file" multiple onChange={handleUpload} />
      <ul>
        {files.map((file, index) => (
          <li key={index}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
}
