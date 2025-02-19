import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const [hoopSize, setHoopSize] = useState(null);
const [hoopSizes, setHoopSizes] = useState([]);

useEffect(() => {
  const fetchHoopSizes = async () => {
    const response = await fetch("/api/get-hoop-sizes");
    const data = await response.json();
    setHoopSizes(data.hoopSizes);
  };
  
  fetchHoopSizes();
}, []);

<select onChange={(e) => setHoopSize(hoopSizes.find(h => h.name === e.target.value))}>
  <option value="">Select Hoop Size</option>
  {hoopSizes.map((size) => (
    <option key={size.name} value={size.name}>{size.name} ({size.width}x{size.height} mm)</option>
  ))}
</select>
const [resizedFile, setResizedFile] = useState(null);

const handleResize = async (fileUrl) => {
  if (!hoopSize) {
    alert("Please select a hoop size first!");
    return;
  }

  const response = await fetch("/api/resize-design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, hoopSize }),
  });

  const data = await response.json();
  setResizedFile(data.resizedFile);
};

<button onClick={() => handleResize(fileUrl)}>Resize for Hoop</button>

{resizedFile && (
  <div>
    <h3>Resized File</h3>
    <a href={resizedFile} download>Download Resized Design</a>
  </div>
)}
const [rotatedFile, setRotatedFile] = useState(null);
const [alignmentGuide, setAlignmentGuide] = useState(null);
const [previewFile, setPreviewFile] = useState(null);

const handlePreview = async (fileUrl) => {
  if (!hoopSize) {
    alert("Please select a hoop size first!");
    return;
  }

  const response = await fetch("/api/hoop-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, hoopSize }),
  });

  const data = await response.json();
  setPreviewFile(data.previewFile);
};

<button onClick={() => handlePreview(fileUrl)}>Preview in Hoop</button>

{previewFile && <img src={previewFile} alt="Hoop Preview" />}
const fetchAlignmentGuide = async () => {
  if (!hoopSize) {
    alert("Please select a hoop size first!");
    return;
  }

  const response = await fetch("/api/generate-hoop-guides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hoopSize }),
  });

  const data = await response.json();
  setAlignmentGuide(data.guideFile);
};

<button onClick={fetchAlignmentGuide}>Show Hoop Guides</button>

{alignmentGuide && <img src={alignmentGuide} alt="Hoop Alignment Guide" />}
const handleAutoRotate = async (fileUrl) => {
  if (!hoopSize) {
    alert("Please select a hoop size first!");
    return;
  }

  const response = await fetch("/api/rotate-design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, hoopSize }),
  });

  const data = await response.json();
  setRotatedFile(data.rotatedFile);
};

<button onClick={() => handleAutoRotate(fileUrl)}>Auto Rotate for Best Fit</button>

{rotatedFile && (
  <div>
    <h3>Optimized Orientation</h3>
    <a href={rotatedFile} download>Download Rotated Design</a>
  </div>
)}
const [isValidHoopSize, setIsValidHoopSize] = useState(null);
const [adjustedFile, setAdjustedFile] = useState(null);
const [scaleFactor, setScaleFactor] = useState(1.0);

const handleAdjustColors = async (fileUrl) => {
  const response = await fetch("/api/adjust-thread-colors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, scaleFactor }),
  });

  const data = await response.json();
  setAdjustedFile(data.adjustedFile);
};

<input type="range" min="0.5" max="2" step="0.1" value={scaleFactor} onChange={(e) => setScaleFactor(e.target.value)} />
<button onClick={() => handleAdjustColors(fileUrl)}>Adjust Thread Colors</button>

{adjustedFile && <img src={adjustedFile} alt="Adjusted Thread Colors" />}
const validateHoopSize = async (fileUrl) => {
  if (!hoopSize) {
    alert("Please select a hoop size first!");
    return;
  }

  const response = await fetch("/api/validate-hoop-size", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, hoopSize }),
  });

  const data = await response.json();
  setIsValidHoopSize(data.valid);
};

<button onClick={() => validateHoopSize(fileUrl)}>Validate Hoop Size</button>

{isValidHoopSize !== null && (
  <p>{isValidHoopSize ? "Design fits within hoop size ✅" : "Design exceeds hoop size ❌"}</p>
)}
const [splitFiles, setSplitFiles] = useState([]);

const handleSplitDesign = async (fileUrl) => {
  if (!hoopSize) {
    alert("Please select a hoop size first!");
    return;
  }

  const response = await fetch("/api/split-design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, hoopSize }),
  });

  const data = await response.json();
  setSplitFiles(data.splitFiles);
};

<button onClick={() => handleSplitDesign(fileUrl)}>Split Design for Multi-Hoop</button>

<ul>
  {splitFiles.map((file, index) => (
    <li key={index}>
      <a href={file} download>Download Hoop Part {index + 1}</a>
    </li>
  ))}
</ul>

export default function Home() {
  const { data: session } = useSession();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const dropRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/list-files?page=${page}&limit=10`);
        const data = await response.json();
        if (response.ok) {
          setUploadedFiles(data.files);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, [page]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/list-files");
        const data = await response.json();
        if (response.ok) {
          setUploadedFiles(data.files);
          setFilteredFiles(data.files);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  const handleBulkUpload = async (event) => {
  const selectedFiles = Array.from(event.target.files);
  if (!selectedFiles.length) return;

  setUploading(true);
  setUploadProgress(0);
  setMessage("");

  const handleBulkDownload = async () => {
  for (const file of uploadedFiles) {
    const link = document.createElement("a");
    link.href = file;
    link.download = file.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

<button onClick={handleBulkDownload}>Download All Files</button>


  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("files", file));

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    setUploadedFiles([...uploadedFiles, ...data.urls]);
    setMessage("Bulk Upload Successful!");
  } catch (error) {
    setMessage("Upload failed. Please try again.");
    console.error("Error uploading files:", error);
  } finally {
    setUploading(false);
    setUploadProgress(100);
  }
};

<input type="file" multiple onChange={handleBulkUpload} />


  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = uploadedFiles.filter((url) =>
      url.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFiles(filtered);
  };


  // Fetch existing uploaded files on load
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/list-files");
        const data = await response.json();
        if (response.ok) {
          setUploadedFiles(data.files);
        } else {
          console.error("Error fetching files:", data.error);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  // Handle file upload via input or drag & drop
  const handleUpload = async (selectedFiles) => {
    if (!selectedFiles.length) return;

    setFiles(selectedFiles);
    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedFiles([...uploadedFiles, ...data.urls]);
      setMessage("Upload successful!");
    } catch (error) {
      setMessage("Upload failed. Please try again.");
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  // Handle drag & drop
  const handleDrop = (event) => {
    event.preventDefault();
    const selectedFiles = Array.from(event.dataTransfer.files);
    handleUpload(selectedFiles);
  };

  const handleDelete = async (fileUrl) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch("/api/delete-file", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setUploadedFiles(uploadedFiles.filter((url) => url !== fileUrl));
      setMessage("File deleted successfully.");
    } catch (error) {
      setMessage("Error deleting file.");
      console.error("Delete error:", error);
    }
  };

  // Highlight drop zone
  useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;

    const handleDragOver = (event) => {
      event.preventDefault();
      dropArea.style.border = "2px dashed #4CAF50";
    };

    const handleDragLeave = () => {
      dropArea.style.border = "2px dashed #ccc";
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {session ? (
        <>
          <p>Welcome, {session.user.username}!</p>
          <button onClick={() => signOut()}>Logout</button>

        {/* File upload UI */}
        </>
      ) : (
        <>
          <p>Please log in to upload files.</p>
          <button onClick={() => signIn()}>Login</button>
      <h1>Embroidery File Uploader</h1>
      
      <div
        ref={dropRef}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        Drag & Drop files here or
        <input type="file" multiple onChange={(e) => handleUpload(Array.from(e.target.files))} />
      </div>

      {uploading && <progress value={uploadProgress} max="100"></progress>}
      {message && <p>{message}</p>}

      <button onClick={() => setShowModal(true)}>View Files</button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <h2>Uploaded Files</h2>
          <button onClick={() => setShowModal(false)}>Close</button>
          <ul>
            {uploadedFiles.map((url, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                {url.match(/\.(png|jpe?g|webp)$/) ? (
                  <img src={url} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", marginRight: "10px" }} />
                ) : (
                  <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                )}
                <button onClick={() => handleDelete(url)} style={{ marginLeft: "10px", cursor: "pointer" }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

return (
    <div>
      <input
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <ul>
        {filteredFiles.map((url, index) => (
          <li key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

<ul>
  {filteredFiles.map((url, index) => (
    <li key={index} style={{ marginBottom: "10px" }}>
      {url.match(/\.(png|jpe?g|webp)$/) ? (
        <img src={url} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", marginRight: "10px" }} />
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
      )}
    </li>
  ))}
</ul>

  return (
    <div>
      <h2>Uploaded Files</h2>
      <ul>
        {uploadedFiles.map((url, index) => (
          <li key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          </li>
        ))}
      </ul>

      <div>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span> Page {page} of {totalPages} </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

const generateShareableLink = (fileUrl) => {
  return `${window.location.origin}/view?file=${encodeURIComponent(fileUrl)}`;
};

<ul>
  {uploadedFiles.map((url, index) => (
    <li key={index}>
      <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
      <button onClick={() => navigator.clipboard.writeText(generateShareableLink(url))}>
        Copy Shareable Link
      </button>
    </li>
  ))}
</ul>

