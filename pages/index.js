import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// Ensure this component is only rendered on the client-side
const Home = () => {
  const [isClient, setIsClient] = useState(false);
  const sessionData = useSession();
  const session = sessionData?.data || null;  // ✅ Fix: Prevents destructuring undefined

  // State for file management
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const dropRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // File versioning state
  const [fileVersions, setFileVersions] = useState([]);

  // Hoop-related state
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);

  // Stitch density recommendation state
  const [fabricType, setFabricType] = useState("cotton");
  const [edgeCount, setEdgeCount] = useState(500);
  const [recommendedDensity, setRecommendedDensity] = useState(null);

  // File processing state
  const [resizedFile, setResizedFile] = useState(null);
  const [rotatedFile, setRotatedFile] = useState(null);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isValidHoopSize, setIsValidHoopSize] = useState(null);
  const [adjustedFile, setAdjustedFile] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [splitFiles, setSplitFiles] = useState([]);

  // Ensure this component runs on the client side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch hoop sizes
  useEffect(() => {
    const fetchHoopSizes = async () => {
      const response = await fetch("/api/get-hoop-sizes");
      const data = await response.json();
      setHoopSizes(data.hoopSizes);
    };
    fetchHoopSizes();
  }, []);

  // Fetch uploaded files
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

  // ✅ Fix: Define handleRecommendDensity to prevent crash
  const handleRecommendDensity = async () => {
    try {
      const response = await fetch("/api/recommend-stitch-density", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fabricType, edgeCount }),
      });

      if (!response.ok) throw new Error("Failed to get recommendation");

      const data = await response.json();
      setRecommendedDensity(data.recommendedDensity);
    } catch (error) {
      console.error("Error fetching stitch density recommendation:", error);
    }
  };

  // ✅ Fix: Define fetchAlignmentGuide to prevent crash
  const fetchAlignmentGuide = async () => {
    try {
      const response = await fetch("/api/get-alignment-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hoopSize }),
      });

      if (!response.ok) throw new Error("Failed to fetch alignment guide");

      const data = await response.json();
      setAlignmentGuide(data.alignmentGuideUrl);
    } catch (error) {
      console.error("Error fetching alignment guide:", error);
    }
  };

  // File Upload Handlers
  const handleUpload = async (selectedFiles) => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");

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

  // File search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilteredFiles(uploadedFiles.filter((url) => url.toLowerCase().includes(query.toLowerCase())));
  };

  if (!isClient) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      {session ? (
        <>
          <p>Welcome, {session.user?.name || "User"}!</p>
          <button onClick={() => signOut()}>Logout</button>
        </>
      ) : (
        <>
          <p>Please log in to upload files.</p>
          <button onClick={() => signIn()}>Login</button>
        </>
      )}

      <h1>Embroidery File Uploader</h1>

      {/* Drag & Drop Upload */}
      <div ref={dropRef} style={{ border: "2px dashed #ccc", padding: "20px", textAlign: "center", marginBottom: "10px" }}>
        Drag & Drop files here or
        <input type="file" multiple onChange={(e) => handleUpload(Array.from(e.target.files))} />
      </div>

      {uploading && <progress value={uploadProgress} max="100"></progress>}
      {message && <p>{message}</p>}

      {/* Hoop Selection */}
      <select onChange={(e) => setHoopSize(hoopSizes.find(h => h.name === e.target.value))}>
        <option value="">Select Hoop Size</option>
        {hoopSizes.map((size) => (
          <option key={size.name} value={size.name}>{size.name} ({size.width}x{size.height} mm)</option>
        ))}
      </select>

      {/* File Search */}
      <input type="text" placeholder="Search files..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />

      {/* Hoop Size Validation & Alignment Guide */}
      <button onClick={fetchAlignmentGuide}>Show Hoop Guides</button>
      {alignmentGuide && <img src={alignmentGuide} alt="Hoop Alignment Guide" />}
    </div>
  );
};

// Ensure this page is only rendered client-side (disabling SSR)
export default dynamic(() => Promise.resolve(Home), { ssr: false });