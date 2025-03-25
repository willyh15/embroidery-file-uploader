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

import FilePreviewCard from "../components/FilePreviewCard";
import StitchPreviewModal from "../components/StitchPreviewModal";
import AutoStitchToggle from "../components/AutoStitchToggle";
import ConvertAllButton from "../components/ConvertAllButton";

import { LogoutIcon, HoopIcon } from "../components/Icons";

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropRef = useRef(null);

  const [isClient, setIsClient] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stitchPreviewUrl, setStitchPreviewUrl] = useState(null);
  const [autoStitchEnabled, setAutoStitchEnabled] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    async function fetchHoopSizes() {
      try {
        const res = await fetch("/api/get-hoop-sizes");
        const data = await res.json();
        setHoopSizes(data.hoopSizes || []);
      } catch {
        toast.error("Failed to load hoop sizes.");
      }
    }
    fetchHoopSizes();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (router.query.setupComplete === "true") {
      toast.success("Role setup complete! You're ready to upload.");
      const url = new URL(window.location);
      url.searchParams.delete("setupComplete");
      window.history.replaceState({}, "", url.toString());
    }
  }, [router.query]);

  useEffect(() => {
    const skipWelcome = localStorage.getItem("skipWelcome");
    if (!skipWelcome) setShowWelcome(true);
  }, []);

  useEffect(() => {
    const activity = localStorage.getItem("recentActivity");
    if (activity) setRecentActivity(JSON.parse(activity));
  }, []);

  const logActivity = (message) => {
    const activity = [
      { message, timestamp: new Date().toLocaleString() },
      ...recentActivity,
    ].slice(0, 5);
    setRecentActivity(activity);
    localStorage.setItem("recentActivity", JSON.stringify(activity));
  };

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      const newFiles = data.urls.map((url) => ({
        url,
        status: "Uploaded",
        name: url.split("/").pop(),
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast.success("Files uploaded successfully!");
      setShowModal(true);
      logActivity("Uploaded file(s)");

      if (autoStitchEnabled) {
        for (const file of newFiles) {
          await handleAutoStitch(file.url);
        }
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const handleAutoStitch = async (fileUrl) => {
    try {
      const res = await fetch("/api/auto-stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      if (!res.ok) throw new Error("Auto-stitch failed");
      toast.success("Auto-stitched file!");
      updateFileStatus(fileUrl, "Auto-stitched");
      logActivity("Auto-stitched a file");
    } catch {
      toast.error("Auto-stitch failed");
      updateFileStatus(fileUrl, "Error");
    }
  };

  const handleConvert = async (fileUrl) => {
    try {
      const res = await fetch("/api/convert-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      if (!res.ok) throw new Error("Conversion failed");
      toast.success("File converted!");
      updateFileStatus(fileUrl, "Converted");
      logActivity("Manually converted a file");
    } catch {
      toast.error("Conversion failed");
      updateFileStatus(fileUrl, "Error");
    }
  };

  const handlePreview = async (fileUrl) => {
    try {
      const res = await fetch("/api/stitch-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await res.json();
      if (!data.previewUrl) throw new Error("Preview missing");
      setStitchPreviewUrl(data.previewUrl);
      updateFileStatus(fileUrl, "Preview Ready");
      logActivity("Previewed a stitch file");
    } catch {
      toast.error("Stitch preview failed");
    }
  };

  const updateFileStatus = (fileUrl, status) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.url === fileUrl ? { ...file, status } : file))
    );
  };

  const batchConvertAll = async () => {
    for (const file of uploadedFiles) {
      await handleConvert(file.url);
    }
  };

  const fetchAlignmentGuide = async () => {
    try {
      const res = await fetch("/api/get-alignment-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hoopSize }),
      });
      const data = await res.json();
      setAlignmentGuide(data.alignmentGuideUrl);
      toast.success("Hoop guide fetched!");
      logActivity("Fetched hoop alignment guide");
    } catch {
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

        <AutoStitchToggle enabled={autoStitchEnabled} onChange={setAutoStitchEnabled} />

        <UploadSection
          dropRef={dropRef}
          uploading={uploading}
          uploadProgress={uploadProgress}
          hovering={hovering}
          setHovering={setHovering}
          handleUpload={handleUpload}
        />

        <HoopSelector hoopSizes={hoopSizes} hoopSize={hoopSize} setHoopSize={setHoopSize} />

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

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

        {uploadedFiles.length > 0 && (
          <>
            <ConvertAllButton onConvertAll={batchConvertAll} />
            {uploadedFiles.map((file) => (
              <FilePreviewCard
                key={file.url}
                file={file}
                onConvert={() => handleConvert(file.url)}
                onPreview={() => handlePreview(file.url)}
                onAutoStitch={() => handleAutoStitch(file.url)}
              />
            ))}
          </>
        )}

        {recentActivity.length > 0 && (
          <Card title="Recent Activity" style={{ marginTop: "2rem" }}>
            <ul style={{ padding: 0 }}>
              {recentActivity.map((a, i) => (
                <li key={i}>
                  {a.message} — <small>{a.timestamp}</small>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <FloatingActions
          isOpen={fabOpen}
          setIsOpen={setFabOpen}
          onUploadClick={() => setShowModal(true)}
          onGuideClick={fetchAlignmentGuide}
        />

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Upload Successful"
        >
          <p>Your file has been uploaded successfully!</p>
        </Modal>

        <Modal
          isOpen={showWelcome}
          onClose={() => {
            setShowWelcome(false);
            localStorage.setItem("skipWelcome", "true");
          }}
          title="Welcome!"
        >
          <p>Start by uploading a file, selecting hoop size, or viewing alignment guides.</p>
          <div style={{ marginTop: "1rem" }}>
            <Button onClick={() => router.push("/admin")}>Go to Admin</Button>
            <Button onClick={() => window.open("/docs", "_blank")}>Help / Docs</Button>
          </div>
          <Button
            style={{ marginTop: "1rem" }}
            onClick={() => {
              setShowWelcome(false);
              localStorage.setItem("skipWelcome", "true");
            }}
          >
            Don’t show again
          </Button>
        </Modal>

        <StitchPreviewModal
          previewUrl={stitchPreviewUrl}
          onClose={() => setStitchPreviewUrl(null)}
        />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });