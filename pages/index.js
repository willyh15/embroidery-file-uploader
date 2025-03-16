import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Loader from "../components/Loader";

import {
  UploadIcon,
  SearchIcon,
  HoopIcon,
  LogoutIcon,
  LoginIcon,
  PlusIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  SettingsIcon,
  ProfileIcon
} from "../components/Icons"; // Additional icons for the UI

const Home = () => {
  const [isClient, setIsClient] = useState(false);
  const sessionData = useSession();
  const session = sessionData?.data || null;
  const dropRef = useRef(null);

  // ─────────── UI States ───────────
  const [showModal, setShowModal] = useState(false);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // 🆕 Sidebar / Menu state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🆕 Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // 🆕 Success Notifications
  const [notifications, setNotifications] = useState([]);

  // ─────────── File Management States ───────────
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

  // ─────────── Hoop Selection ───────────
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);

  // ─────────── Additional States (Stitch Density, etc.) ───────────
  const [fabricType, setFabricType] = useState("cotton");
  const [edgeCount, setEdgeCount] = useState(500);
  const [recommendedDensity, setRecommendedDensity] = useState(null);
  const [resizedFile, setResizedFile] = useState(null);
  const [rotatedFile, setRotatedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isValidHoopSize, setIsValidHoopSize] = useState(null);
  const [adjustedFile, setAdjustedFile] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [splitFiles, setSplitFiles] = useState([]);

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
      addNotification("Files uploaded successfully!", "success");
    } catch (error) {
      setMessage("Upload failed. Please try again.");
      console.error("Error uploading file:", error);
      addNotification("Upload failed!", "error");
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  // ✅ Helper: Success Notification
  const addNotification = (text, type = "success") => {
    const id = Date.now();
    setNotifications([...notifications, { id, text, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
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
      addNotification("Hoop guide fetched!", "success");
    } catch (error) {
      console.error("Error fetching alignment guide:", error);
      addNotification("Failed to fetch hoop guide!", "error");
    }
  };

  // 🆕 Toggle Dark Mode (Smooth transitions)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    const root = document.documentElement;
    if (!darkMode) {
      root.classList.add("dark");
      addNotification("Dark Mode Activated", "success");
    } else {
      root.classList.remove("dark");
      addNotification("Light Mode Activated", "success");
    }
  };

  // 🆕 Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!isClient) return <Loader />;

  return (
    <div className={`container fadeIn ${darkMode ? "dark-mode" : ""}`}>
      {/* ───────────────────────────
          🆕 SIDEBAR NAVIGATION
          ─────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <Button onClick={toggleSidebar} className="close-sidebar-btn">X</Button>
        </div>
        <ul>
          <li><a href="#"><ProfileIcon /> Profile</a></li>
          <li><a href="#"><SettingsIcon /> Settings</a></li>
          <li><a href="#">My Files</a></li>
        </ul>
      </aside>

      {/* 🆕 Sidebar Toggle Button */}
      <div className="menu-btn" onClick={toggleSidebar}>
        <MenuIcon />
      </div>

      {/* 🆕 Dark Mode Toggle */}
      <div className="dark-mode-toggle" onClick={toggleDarkMode}>
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </div>

      {/* ───────────────────────────
          AUTHENTICATION SECTION
          ─────────────────────────── */}
      {session ? (
        <Card title={`Welcome, ${session.user?.name || "User"}!`}>
          <Button
            onClick={() => signOut()}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
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

      {/* ───────────────────────────
          FILE UPLOAD SECTION
          ─────────────────────────── */}
      <Card title="Upload Files">
        <div
          ref={dropRef}
          className={`upload-box soft-shadow ${uploading ? 'dragover' : ''}`}
          onDragEnter={() => setHovering(true)}
          onDragLeave={() => setHovering(false)}
        >
          <UploadIcon />
          Drag & Drop files here or
          <input
            type="file"
            multiple
            onChange={(e) => handleUpload(Array.from(e.target.files))}
          />
        </div>

        {uploading ? <Loader /> : <Button onClick={handleUpload}>Upload File</Button>}

        {/* ✅ Upload Progress Bar */}
        {uploading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        {/* 🆕 File Previews */}
        {uploadedFiles.map((url, i) => (
          <div key={i} className="file-preview">
            <img src={url} alt="Uploaded preview" className="hand-drawn thumb" />
          </div>
        ))}
      </Card>

      {/* ───────────────────────────
          HOOP SELECTION
          ─────────────────────────── */}
      <Card title="Hoop Selection">
        <select
          className="dropdown"
          onChange={(e) => setHoopSize(hoopSizes.find(h => h.name === e.target.value))}
        >
          <option value="">Select Hoop Size</option>
          {hoopSizes.map((size) => (
            <option key={size.name} value={size.name}>
              {size.name} ({size.width}x{size.height} mm)
            </option>
          ))}
        </select>
      </Card>

      {/* ───────────────────────────
          FILE SEARCH
          ─────────────────────────── */}
      <Card title="Search Files">
        <div className="search-bar">
          <SearchIcon />
          <input
            className="search-input"
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* ───────────────────────────
          HOOP ALIGNMENT GUIDE
          ─────────────────────────── */}
      <Button onClick={fetchAlignmentGuide}>
        <HoopIcon /> Show Hoop Guides
      </Button>
      {alignmentGuide && (
        <img
          className="hand-drawn"
          src={alignmentGuide}
          alt="Hoop Alignment Guide"
        />
      )}

      {/* ───────────────────────────
          UPLOAD CONFIRMATION MODAL
          ─────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Upload Successful"
      >
        <p>Your file has been uploaded successfully!</p>
      </Modal>

      {/* ───────────────────────────
          FLOATING ACTION BUTTON (FAB)
          ─────────────────────────── */}
      <div className="fab-container" onClick={() => setFabOpen(!fabOpen)}>
        <div className="fab"><PlusIcon /></div>
        {fabOpen && (
          <div className="fab-options">
            <Button onClick={() => setShowModal(true)}>Upload</Button>
            <Button onClick={() => fetchAlignmentGuide()}>Hoop Guide</Button>
          </div>
        )}
      </div>

      {/* ───────────────────────────
          NOTIFICATION SYSTEM
          ─────────────────────────── */}
      <div className="notification-container">
        {notifications.map((note) => (
          <div key={note.id} className={`notification ${note.type}`}>
            {note.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Home), { ssr: false });