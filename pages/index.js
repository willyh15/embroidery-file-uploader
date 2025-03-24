import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
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
  PlusIcon,
  MenuIcon,
  SettingsIcon,
  ProfileIcon,
} from "../components/Icons";

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const dropRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchHoopSizes() {
      try {
        const res = await fetch("/api/get-hoop-sizes");
        const data = await res.json();
        setHoopSizes(data.hoopSizes || []);
      } catch (error) {
        console.error("Failed to load hoop sizes", error);
      }
    }
    fetchHoopSizes();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  function addNotification(text, type = "success") {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }

  async function handleUpload(selectedFiles) {
    if (!selectedFiles.length) return;

    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedFiles((prev) => [...prev, ...data.urls]);
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

  async function fetchAlignmentGuide() {
    try {
      const res = await fetch("/api/get-alignment-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hoopSize }),
      });

      if (!res.ok) throw new Error("Failed to fetch alignment guide");

      const data = await res.json();
      setAlignmentGuide(data.alignmentGuideUrl);
      addNotification("Hoop guide fetched!", "success");
    } catch (err) {
      console.error(err);
      addNotification("Failed to fetch hoop guide!", "error");
    }
  }

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  if (!isClient || status === "loading") return <Loader />;

  if (!session) return null; // Wait for redirect if not authenticated

  return (
    <div>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <Button onClick={toggleSidebar} className="close-sidebar-btn">
            X
          </Button>
        </div>
        <ul>
          <li><a href="#"><ProfileIcon /> Profile</a></li>
          <li><a href="#"><SettingsIcon /> Settings</a></li>
          <li><a href="#">My Files</a></li>
        </ul>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay open" onClick={toggleSidebar} />}

      <div className="menu-btn" onClick={toggleSidebar}>
        <MenuIcon />
      </div>

      <div className="main-content container fadeIn">
        <Card title={`Welcome, ${session.user?.name || "User"}!`}>
          <Button onClick={() => signOut()}>
            <LogoutIcon /> Logout
          </Button>
        </Card>

        <h1 className="title">Embroidery File Uploader</h1>

        <Card title="Upload Files">
          <div
            ref={dropRef}
            className={`upload-box soft-shadow ${hovering ? "dragover" : ""}`}
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
          <Button style={{ marginTop: "1rem" }} onClick={() => handleUpload([])}>
            Upload File
          </Button>
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </Card>

        <Card title="Hoop Selection">
          <select
            className="dropdown"
            onChange={(e) => setHoopSize(hoopSizes.find((h) => h.name === e.target.value))}
          >
            <option value="">Select Hoop Size</option>
            {hoopSizes.map((size) => (
              <option key={size.name} value={size.name}>
                {size.name} ({size.width}x{size.height} mm)
              </option>
            ))}
          </select>
        </Card>

        <Card title="Search Files">
          <div className="search-bar" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
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

        <Button style={{ marginTop: "1.5rem" }} onClick={fetchAlignmentGuide}>
          <HoopIcon /> Show Hoop Guides
        </Button>
        {alignmentGuide && (
          <img
            className="hand-drawn"
            src={alignmentGuide}
            alt="Hoop Alignment Guide"
            style={{ marginTop: "1rem" }}
          />
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Successful">
          <p>Your file has been uploaded successfully!</p>
        </Modal>

        <div className="fab-container" onClick={() => setFabOpen(!fabOpen)}>
          <div className="fab">
            <PlusIcon />
          </div>
          {fabOpen && (
            <div className="fab-options">
              <Button onClick={() => setShowModal(true)}>Upload</Button>
              <Button onClick={fetchAlignmentGuide}>Hoop Guide</Button>
            </div>
          )}
        </div>

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