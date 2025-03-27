import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { uploadFilesWithProgress } from "../lib/uploadWithProgress";

import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import AutoStitchToggle from "../components/AutoStitchToggle";
import UploadSection from "../components/UploadSection";
import HoopSelector from "../components/HoopSelector";
import SearchBar from "../components/SearchBar";
import ConvertAllButton from "../components/ConvertAllButton";
import FilePreviewCard from "../components/FilePreviewCard";
import StitchPreviewModal from "../components/StitchPreviewModal";
import WelcomeCard from "../components/WelcomeCard";
import AlignmentGuide from "../components/AlignmentGuide";
import UploaderDashboard from "../components/UploaderDashboard";

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [autoStitchEnabled, setAutoStitchEnabled] = useState(false);

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    const fetchHoopSizes = async () => {
      try {
        const res = await fetch("/api/get-hoop-sizes");
        const data = await res.json();
        setHoopSizes(data.hoopSizes || []);
      } catch {
        toast.error("Failed to load hoop sizes.");
      }
    };
    fetchHoopSizes();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status]);

  useEffect(() => {
    if (router.query.setupComplete === "true") {
      toast.success("Role setup complete! You're ready to upload.");
      const url = new URL(window.location);
      url.searchParams.delete("setupComplete");
      window.history.replaceState({}, "", url.toString());
    }
  }, [router.query]);

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
          ? { ...file, status, stage: stage || file.stage, convertedUrl: convertedUrl || file.convertedUrl }
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
      onError: () => {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Conversion failed");

      updateFileStatus(fileUrl, "Converted");
      toast.success("File converted!");

      await fetch("/api/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: data.convertedUrl }),
      });
    } catch {
      toast.error("Conversion failed");
      updateFileStatus(fileUrl, "Error");
    }
  };

  const handleRetry = async (fileUrl) => {
    const file = uploadedFiles.find((f) => f.url === fileUrl);
    if (!file) return;

    if (file.status === "Error" && file.stage === "converting") {
      await handleConvert(fileUrl);
    } else {
      await handleAutoStitch(fileUrl);
    }
  };

  const handlePreview = (fileUrl) => {
    setPreviewFileUrl(fileUrl);
  };

  if (!isClient || status === "loading") return <Loader />;
  if (!session) return null;

  return (
    <div>
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} toggle={setSidebarOpen} />
      <div className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-content container fadeIn">
        <WelcomeCard user={session.user} onLogout={signOut} />
        <UploaderDashboard
          dropRef={dropRef}
          hovering={hovering}
          setHovering={setHovering}
          handleUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
          autoStitchEnabled={autoStitchEnabled}
          setAutoStitchEnabled={setAutoStitchEnabled}
          hoopSizes={hoopSizes}
          hoopSize={hoopSize}
          setHoopSize={setHoopSize}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <AlignmentGuide
          alignmentGuide={alignmentGuide}
          fetchGuide={async () => {
            const res = await fetch("/api/get-alignment-guide", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ hoopSize }),
            });
            const data = await res.json();
            setAlignmentGuide(data.alignmentGuideUrl);
            toast.success("Hoop guide fetched!");
          }}
        />

        {uploadedFiles.length > 0 && (
          <>
            <ConvertAllButton
              onConvertAll={() =>
                uploadedFiles.forEach((file) => handleConvert(file.url))
              }
            />
            {uploadedFiles.map((file) => (
              <FilePreviewCard
                key={file.url}
                file={file}
                onConvert={() => handleConvert(file.url)}
                onPreview={() => handlePreview(file.url)}
                onAutoStitch={() => handleAutoStitch(file.url)}
                onRetry={() => handleRetry(file.url)}
              />
            ))}
          </>
        )}
      </div>

      {previewFileUrl && (
        <StitchPreviewModal
          fileUrl={previewFileUrl}
          onClose={() => setPreviewFileUrl(null)}
        />
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });