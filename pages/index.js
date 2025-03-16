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
  SettingsIcon,
  ProfileIcon
} from "../components/Icons";

function Home() {
  const [isClient, setIsClient] = useState(false);
  const sessionData = useSession();
  const session = sessionData?.data || null;

  // Refs
  const dropRef = useRef(null);

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // File Management
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Hoop State
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);

  // Additional
  const [fabricType, setFabricType] = useState("cotton");
  const [edgeCount, setEdgeCount] = useState(500);
  const [recommendedDensity, setRecommendedDensity] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchHoopSizes() {
      try {
        const res = await fetch("/api/get-hoop-sizes");
        const data = await res.json();
        setHoopSizes(data.hoopSizes);
      } catch (e) {
        console.error("Error fetching hoop sizes:", e);
      }
    }
    fetchHoopSizes();
  }, []);

  // Notifications
  function addNotification(text, type = "success") {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((n) => n.filter((nt) => nt.id !== id));
    }, 3000);
  }

  // Upload Handler
  async function handleUpload(selectedFiles) {
    if (!selectedFiles.length) return;
    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedFiles([...uploadedFiles, ...data.urls]);
      setMessage("Upload successful!");
      setShowModal(true);
      addNotification("Files uploaded successfully!", "success");
    } catch (err) {
      setMessage("Upload failed. Please try again.");
      console.error("Error uploading:", err);
      addNotification("Upload failed!", "error");
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  }

  // Hoop Guide
  async function fetchAlignmentGuide() {
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
      console.error(error);
      addNotification("Failed to fetch hoop guide!", "error");
    }
  }

  // Sidebar Toggle
  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  // Early SSR loader
  if (!isClient) return <Loader />;

  return (
    <div>
      {/* OVERLAY SIDEBAR */}
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

      {/* BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div className="sidebar-overlay open" onClick={toggleSidebar} />
      )}

      {/* SIDEBAR Toggle */}
      <div className="menu-btn" onClick={toggleSidebar}>
        <MenuIcon />
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content container fadeIn">
        {/* AUTH */}
        {session ? (
          <Card title={`Welcome, ${session.user?.name || "User"}!`}>
            <Button onClick={() => signOut()}>
              <LogoutIcon /> Logout
            </Button>
          </Card>
        ) : (
          <Card title="Please log in to upload files.">
            <Button onClick={() => signIn()}>
              <LoginIcon /> Login
            </Button>
          </Card>
        )}

        <h1 className="title">Embroidery File Uploader</h1>

        {/* FILE UPLOAD */}
        <Card title="Upload Files">
          <div
            ref={dropRef}
            className={`upload-box soft-shadow ${uploading ? "dragover" : ""}`}
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

          {uploading && (
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}

          {/* Previews */}
          {uploadedFiles.map((url, i) => (
            <div key={i} className="file-preview">
              <img src={url} alt="Uploaded preview" className="hand-drawn thumb" />
            </div>
          ))}
        </Card>

        {/* Hoop Selection */}
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

        {/* Search */}
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

        {/* Hoop Guide */}
        <Button onClick={fetchAlignmentGuide}>
          <HoopIcon /> Show Hoop Guides
        </Button>
        {alignmentGuide && (
          <img className="hand-drawn" src={alignmentGuide} alt="Hoop Alignment Guide" />
        )}

        {/* MODAL */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Successful">
          <p>Your file has been uploaded successfully!</p>
        </Modal>

        {/* FAB */}
        <div className="fab-container" onClick={() => setFabOpen(!fabOpen)}>
          <div className="fab"><PlusIcon /></div>
          {fabOpen && (
            <div className="fab-options">
              <Button onClick={() => setShowModal(true)}>Upload</Button>
              <Button onClick={fetchAlignmentGuide}>Hoop Guide</Button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="notification-container">
          {notifications.map((note) => (
            <div key={note.id} className={`notification ${note.type}`}>
              {note.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });