import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { uploadFilesWithProgress } from "../lib/uploadWithProgress";

import FileFilters from "../components/FileFilters";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import AutoStitchToggle from "../components/AutoStitchToggle";
import UploadSection from "../components/UploadSection";
import HoopSelector from "../components/HoopSelector";
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
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

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

  
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 6;

  const filteredFiles = uploadedFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? file.status === statusFilter : true;
    const matchesType = typeFilter ? file.name.toLowerCase().endsWith(typeFilter) : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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

  const handleDownload = async (fileUrl, type) => {
    try {
      await fetch("/api/log-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, fileType: type }),
      });
      logActivity(\`Downloaded \${type.toUpperCase()} for a file\`);
    } catch (error) {
      console.error("Download tracking failed:", error);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Conversion failed");

      updateFileStatus(fileUrl, "Converted");
      toast.success("File converted!");
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

  const handleToggleVisibility = () => {}; // Placeholder if needed

  const filteredFiles = uploadedFiles.filter((file) => {
    const matchesSearch = file.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? file.status === statusFilter : true;
    const ext = file.name?.split('.').pop()?.toLowerCase();
    const matchesType = typeFilter ? file.name?.endsWith(typeFilter) : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (!isClient || status === "loading") return <Loader />;
  if (!session) return null;

  return (
    <div>
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} toggle={setSidebarOpen} />
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

        <FileFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />

        {filteredFiles.length > 0 && (
          <>
            <ConvertAllButton onConvertAll={() =>
              filteredFiles.forEach((file) => handleConvert(file.url))
            } />
            {filteredFiles.map((file) => (
              <FilePreviewCard
                key={file.url}
                file={file}
                onConvert={() => handleConvert(file.url)}
                onPreview={() => handlePreview(file.url)}
                onAutoStitch={() => handleAutoStitch(file.url)}
                onRetry={() => handleRetry(file.url)}
                onDownload={handleDownload}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                  Previous
                </button>
                <span style={{ margin: "0 10px" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            )}

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