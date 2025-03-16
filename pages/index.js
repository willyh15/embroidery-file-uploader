import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Loader from "../components/Loader";

const Home = () => {
  const [isClient, setIsClient] = useState(false);
  const sessionData = useSession();
  const session = sessionData?.data || null;
  const dropRef = useRef(null);

  // 🔹 State for file management
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fileVersions, setFileVersions] = useState([]);

  // 🔹 Hoop-related state
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);

  // 🔹 Stitch density recommendation state
  const [fabricType, setFabricType] = useState("cotton");
  const [edgeCount, setEdgeCount] = useState(500);
  const [recommendedDensity, setRecommendedDensity] = useState(null);

  // 🔹 File processing state
  const [resizedFile, setResizedFile] = useState(null);
  const [rotatedFile, setRotatedFile] = useState(null);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isValidHoopSize, setIsValidHoopSize] = useState(null);
  const [adjustedFile, setAdjustedFile] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [splitFiles, setSplitFiles] = useState([]);

  // 🔹 Modal state
  const [showModal, setShowModal] = useState(false);

  // ✅ Ensure this component runs only on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Fetch available hoop sizes
  useEffect(() => {
    const fetchHoopSizes = async () => {
      const response = await fetch("/api/get-hoop-sizes");
      const data = await response.json();
      setHoopSizes(data.hoopSizes);
    };
    fetchHoopSizes();
  }, []);

  // ✅ Fetch uploaded files (pagination support)
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

  // ✅ Fetch stitch density recommendation
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

  // ✅ Fetch hoop alignment guide
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

  // ✅ File Upload Handler with loading state
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
      setShowModal(true);
    } catch (error) {
      setMessage("Upload failed. Please try again.");
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  // ✅ File search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilteredFiles(uploadedFiles.filter((url) => url.toLowerCase().includes(query.toLowerCase())));
  };

  if (!isClient) return <Loader />;

  return (
    <div style={{ padding: 20 }}>
      {/* ✅ Authentication */}
      {session ? (
        <Card title={`Welcome, ${session.user?.name || "User"}!`}>
          <Button onClick={() => signOut()}>Logout</Button>
        </Card>
      ) : (
        <Card title="Please log in to upload files.">
          <Button onClick={() => signIn()}>Login</Button>
        </Card>
      )}

      <h1>Embroidery File Uploader</h1>

      {/* ✅ File Upload Section */}
      <Card title="Upload Files">
        <div ref={dropRef} className="soft-shadow" style={{
          border: "2px dashed var(--border-color)", 
          padding: "20px", 
          textAlign: "center",
          background: "white",
          borderRadius: "var(--radius)"
        }}>
          Drag & Drop files here or
          <input type="file" multiple onChange={(e) => handleUpload(Array.from(e.target.files))} />
        </div>
        {uploading ? <Loader /> : <Button onClick={handleUpload}>Upload File</Button>}
      </Card>

      {/* ✅ Hoop Selection */}
      <Card title="Hoop Selection">
        <select onChange={(e) => setHoopSize(hoopSizes.find(h => h.name === e.target.value))}>
          <option value="">Select Hoop Size</option>
          {hoopSizes.map((size) => (
            <option key={size.name} value={size.name}>{size.name} ({size.width}x{size.height} mm)</option>
          ))}
        </select>
      </Card>

      {/* ✅ File Search */}
      <Card title="Search Files">
        <input type="text" placeholder="Search files..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
      </Card>

      {/* ✅ Hoop Alignment Guide */}
      <Button onClick={fetchAlignmentGuide}>Show Hoop Guides</Button>
      {alignmentGuide && <img src={alignmentGuide} alt="Hoop Alignment Guide" />}

      {/* ✅ Upload Confirmation Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Successful">
        <p>Your file has been uploaded successfully!</p>
      </Modal>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Home), { ssr: false });