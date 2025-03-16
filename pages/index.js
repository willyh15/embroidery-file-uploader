import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import { UploadIcon, SearchIcon, HoopIcon, LogoutIcon, LoginIcon, PlusIcon } from "../components/Icons"; // ✅ Added Themed Icons

const Home = () => {
  const [isClient, setIsClient] = useState(false);
  const sessionData = useSession();
  const session = sessionData?.data || null;
  const dropRef = useRef(null);

  // 🔹 UI States
  const [showModal, setShowModal] = useState(false);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // 🔹 File Management States
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

  // 🔹 Hoop Selection
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);

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

  // ✅ File Upload Handler
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
    }
  };

  // ✅ Fetch Alignment Guide
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

  if (!isClient) return <Loader />;

  return (
    <div className="container fadeIn">
      {/* ✅ Authentication */}
      {session ? (
        <Card title={`Welcome, ${session.user?.name || "User"}!`}>
          <Button onClick={() => signOut()} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <LogoutIcon /> Logout
          </Button>
          {showTooltip && <span className="tooltip">Sign out of your account</span>}
        </Card>
      ) : (
        <Card title="Please log in to upload files.">
          <Button onClick={() => signIn()}>
            <LoginIcon /> Login
          </Button>
        </Card>
      )}

      <h1 className="title">Embroidery File Uploader</h1>

      {/* ✅ File Upload Section with Drag & Drop Effect */}
      <Card title="Upload Files">
        <div ref={dropRef} className={`upload-box soft-shadow ${uploading ? 'dragover' : ''}`}>
          <UploadIcon />
          Drag & Drop files here or
          <input type="file" multiple onChange={(e) => handleUpload(Array.from(e.target.files))} />
        </div>
        {uploading ? <Loader /> : <Button onClick={handleUpload}>Upload File</Button>}

        {/* ✅ Upload Progress Bar */}
        {uploading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
      </Card>

      {/* ✅ Hoop Selection */}
      <Card title="Hoop Selection">
        <select className="dropdown" onChange={(e) => setHoopSize(hoopSizes.find(h => h.name === e.target.value))}>
          <option value="">Select Hoop Size</option>
          {hoopSizes.map((size) => (
            <option key={size.name} value={size.name}>{size.name} ({size.width}x{size.height} mm)</option>
          ))}
        </select>
      </Card>

      {/* ✅ File Search */}
      <Card title="Search Files">
        <div className="search-bar">
          <SearchIcon />
          <input className="search-input" type="text" placeholder="Search files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </Card>

      {/* ✅ Hoop Alignment Guide */}
      <Button onClick={fetchAlignmentGuide}>
        <HoopIcon /> Show Hoop Guides
      </Button>
      {alignmentGuide && <img className="hand-drawn" src={alignmentGuide} alt="Hoop Alignment Guide" />}

      {/* ✅ Upload Confirmation Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Successful">
        <p>Your file has been uploaded successfully!</p>
      </Modal>

      {/* ✅ Floating Action Button (FAB) */}
      <div className="fab-container" onClick={() => setFabOpen(!fabOpen)}>
        <div className="fab"><PlusIcon /></div>
        {fabOpen && (
          <div className="fab-options">
            <Button onClick={() => setShowModal(true)}>Upload</Button>
            <Button onClick={() => fetchAlignmentGuide()}>Hoop Guide</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Home), { ssr: false });