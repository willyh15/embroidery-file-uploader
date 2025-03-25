// pages/index.js
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";

import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import HoopSelector from "../components/HoopSelector";
import SearchBar from "../components/SearchBar";
import FloatingActions from "../components/FloatingActions";

import {
  LogoutIcon,
  HoopIcon,
} from "../components/Icons";

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    async function fetchHoopSizes() {
      try {
        const res = await fetch("/api/get-hoop-sizes");
        const data = await res.json();
        setHoopSizes(data.hoopSizes || []);
      } catch (err) {
        console.error("Failed to load hoop sizes", err);
        toast.error("Failed to load hoop sizes.");
      }
    }
    fetchHoopSizes();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    // Show welcome modal if it's the first visit after login
    const dontShowAgain = localStorage.getItem("hideWelcome");
    if (!dontShowAgain) setShowWelcome(true);
  }, []);

  useEffect(() => {
    if (router.query.setupComplete === "true") {
      toast.success("Role setup complete! You're ready to upload.");
      router.replace("/", undefined, { shallow: true });
    }
  }, [router]);

  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/get-user-activity");
      const data = await res.json();
      setActivityLog(data.activities || []);
    } catch (err) {
      console.error("Failed to fetch activity log", err);
    }
  };

  useEffect(() => {
    if (session?.user) fetchActivity();
  }, [session]);

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedFiles((prev) => [...prev, ...data.urls]);
      setShowModal(true);
      toast.success("Files uploaded successfully!");
      fetchActivity(); // update log
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const fetchAlignmentGuide = async () => {
    try {
      const res = await fetch("/api/get-alignment-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hoopSize }),
      });

      if (!res.ok) throw new Error("Failed to fetch alignment guide");

      const data = await res.json();
      setAlignmentGuide(data.alignmentGuideUrl);
      toast.success("Hoop guide fetched!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch hoop guide.");
    }
  };

  if (!isClient || status === "loading") return <Loader />;
  if (!session) return null;

  return (
    <div>
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} toggle={setSidebarOpen} />
      <div className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-content container fadeIn">
        <Card title={`Welcome, ${session.user?.name || "User"}!`}>
          <Button onClick={() => signOut()}>
            <LogoutIcon /> Logout
          </Button>
        </Card>

        <h1 className="title">Embroidery File Uploader</h1>

        <UploadSection
          dropRef={dropRef}
          uploading={uploading}
          uploadProgress={uploadProgress}
          hovering={hovering}
          setHovering={setHovering}
          handleUpload={handleUpload}
        />

        <HoopSelector
          hoopSizes={hoopSizes}
          hoopSize={hoopSize}
          setHoopSize={setHoopSize}
        />

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

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

        {/* Recent Activity */}
        <div style={{ marginTop: "2rem" }}>
          <h3>Recent Activity</h3>
          {activityLog.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {activityLog.slice(0, 5).map((item, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  <strong>{item.action}</strong> <br />
                  <small>{new Date(item.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity.</p>
          )}
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Upload Successful"
        >
          <p>Your file has been uploaded successfully!</p>
        </Modal>

        {/* Welcome Modal */}
        <Modal
          isOpen={showWelcome}
          onClose={() => setShowWelcome(false)}
          title="Welcome!"
        >
          <p>Welcome to your embroidery uploader! Here are a few tips:</p>
          <ul>
            <li>Use the drag & drop area to upload PNG, SVG, or WEBP files</li>
            <li>Select your hoop size before uploading</li>
            <li>Click “Show Hoop Guides” to preview alignment</li>
          </ul>
          <div style={{ marginTop: "1rem" }}>
            <Button onClick={() => router.push("/admin")}>Go to Admin</Button>
            <Button
              onClick={() => {
                setShowWelcome(false);
                localStorage.setItem("hideWelcome", "true");
              }}
              style={{ marginLeft: "1rem" }}
            >
              Don’t show again
            </Button>
          </div>
        </Modal>

        <FloatingActions
          isOpen={fabOpen}
          setIsOpen={setFabOpen}
          onUploadClick={() => setShowModal(true)}
          onGuideClick={fetchAlignmentGuide}
        />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });