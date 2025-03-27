import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { uploadFilesWithProgress } from "../lib/uploadWithProgress";
import axios from "axios";

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
      } catch (error) {
        console.error("Error fetching hoop sizes:", error);
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

  useEffect(() => {
    let interval;
    if (uploadedFiles.length > 0) {
      interval = setInterval(() => pollRedisProgress(), 2000);
    }
    return () => clearInterval(interval);
  }, [uploadedFiles]);

  const pollRedisProgress = async () => {
  for (const file of uploadedFiles) {
    try {
      const res = await fetch(`/api/progress?fileUrl=${encodeURIComponent(file.url)}`);
      const data = await res.json();
      if (res.ok) {
        updateFileProgress(file.url, data.progress);
        updateFileStatus(file.url, data.status, null, data.stage);
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }
};

const updateFileStatus = (fileUrl, status, convertedUrl = null, stage = null) => {
  setUploadedFiles((prev) =>
    prev.map((file) =>
      file.url === fileUrl
        ? {
            ...file,
            status,
            stage: stage || file.stage,
            convertedUrl: convertedUrl || file.convertedUrl,
          }
        : file
    )
  );
};

  const updateFileProgress = (fileUrl, progress) => {
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.url === fileUrl ? { ...file, progress } : file
      )
    );
  };

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

    uploadFilesWithProgress({
      files,
      onProgress: (percent) => setUploadProgress(percent),
      onComplete: (uploaded) => {
        const newFiles = uploaded.map((entry) => ({
          url: entry.url,
          status: "Uploaded",
          name: entry.url.split("/").pop(),
          progress: 100,
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
        toast.success("Files uploaded successfully!");
        setShowModal(true);
        logActivity("Uploaded file(s)");

        if (autoStitchEnabled) {
          for (const file of newFiles) {
            handleAutoStitch(file.url);
          }
        }

        setUploading(false);
        setUploadProgress(100);
      },
      onError: (err) => {
        toast.error("Upload failed");
        setUploading(false);
        setUploadProgress(0);
      },
    });
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
    } catch (error) {
      console.error("Auto-stitch failed:", error);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Conversion failed");

      updateFileStatus(fileUrl, "Converted");
      toast.success("File converted!");

      // Log version
      await fetch("/api/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: data.convertedUrl }),
      });
    } catch (error) {
      console.error("Conversion failed:", error);
      toast.error("Conversion failed");
      updateFileStatus(fileUrl, "Error");
    }
  };
  
  const handleRetry = async (fileUrl) => {
  const file = uploadedFiles.find((f) => f.url === fileUrl);
  if (!file) return;

  if (file.status === "Error" && file.stage === "converting") {
    await handleConvert(fileUrl);
  } else if (file.status === "Error") {
    await handleAutoStitch(fileUrl);
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
    } catch (error) {
      console.error("Fetch alignment guide failed:", error);
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
            <ConvertAllButton onConvertAll={() =>
              uploadedFiles.forEach((file) => handleConvert(file.url))
            } />
            {uploadedFiles.map((file) => (
              <FilePreviewCard
                key={file.url}
                file={file}
                onConvert={() => handleConvert(file.url)}
                onPreview={() => {}}
                onAutoStitch={() => handleAutoStitch(file.url)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });