// pages/index.js
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import FileCard from "../components/FileCard";
import UploadBox from "../components/UploadBox";
import SidebarFilters from "../components/SidebarFilters";
import PaginationControls from "../components/PaginationControls";
import OnboardingModal from "../components/OnboardingModal";
import RecentActivityPanel from "../components/RecentActivityPanel";
import StitchPreviewModal from "../components/StitchPreviewModal";
import StitchEditor from "../components/StitchEditor";

const FLASK_BASE = process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org";
const ITEMS_PER_PAGE = 6;

function Home() {
  const dropRef = useRef(null);

  const [isClient, setIsClient] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [editFileUrl, setEditFileUrl] = useState(null);

  useEffect(() => {
    console.log("[Home] Component mounted");
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("onboardingShown")) {
      setShowOnboarding(true);
      localStorage.setItem("onboardingShown", "true");
    }
  }, []);

  const handleUpload = async (files) => {
  if (!files.length) return;
  setUploading(true);

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const flaskUploadUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/upload`;

    const res = await fetch(flaskUploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.urls) throw new Error(data.error || "Upload failed");

    const newFiles = data.urls.map(file => ({
      ...file,
      status: "Uploaded",
      pesUrl: "",
      taskId: "",
      stage: "",
    }));

    console.log("[Upload] Received files:", newFiles);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setFilteredFiles(prev => [...prev, ...newFiles]);
    setCurrentPage(1);

    toast.success("Upload complete");
  } catch (err) {
    console.error("[Upload Error]", err);
    toast.error(err.message || "Upload failed");
  } finally {
    setUploading(false);
  }
};

  const handleConvert = async (fileUrl) => {
    console.log(`[Convert] Starting conversion for: ${fileUrl}`);
    updateFileStatus(fileUrl, "Converting", "initiating");

    try {
      const res = await fetch("/api/convert-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.taskId) throw new Error("Conversion failed to start");

      updateFileStatus(fileUrl, "Converting", "processing");
      pollConversionStatus(data.taskId, fileUrl);
    } catch (err) {
      console.error("[Convert Error]", err);
      toast.error(err.message);
      updateFileStatus(fileUrl, "Error", "failed");
    }
  };

  const pollConversionStatus = (taskId, fileUrl) => {
  console.log(`[Polling] Task ID: ${taskId}`);
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/api/progress?taskId=${taskId}`);
      if (!res.ok) throw new Error(`Progress API error: ${res.status}`);

      const data = await res.json();
      console.log("[Polling Response]", data);

      if (data.state === "done" && data.pesUrl) {
        updateFileStatus(fileUrl, "Converted", "done", data.pesUrl);
        clearInterval(interval);
        toast.success("Conversion complete!");
      } else if (data.state === "error" || data.status?.startsWith("Error")) {
        updateFileStatus(fileUrl, "Error", "failed");
        clearInterval(interval);
        toast.error("Conversion failed.");
      } else {
        // Still processing - update intermediate stage if available
        updateFileStatus(fileUrl, "Converting", data.stage || "processing");
      }
    } catch (err) {
      console.error("[Polling Error]", err);
      updateFileStatus(fileUrl, "Error", "poll-failed");
      clearInterval(interval);
      toast.error("Polling error");
    }
  }, 3000); // you can change to 1500 if you want faster
};

  const updateFileStatus = (fileUrl, status, stage = "", pesUrl = "") => {
  if (!fileUrl || !status) {
    console.warn("[updateFileStatus] Skipping invalid update:", { fileUrl, status });
    return;
  }

  setUploadedFiles(prev => {
    const updatedFiles = prev.map(file => {
      if (!file || !file.url) return file;
      if (file.url !== fileUrl) return file;

      console.log("[updateFileStatus] Updating file:", { fileUrl, status, stage, pesUrl });

      return {
        ...file,
        status,
        stage: stage || "processing",
        convertedPes: pesUrl || file.convertedPes || "",
        updatedAt: Date.now(),
      };
    });

    return updatedFiles.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  });

  setFilteredFiles(prev => {
    const updatedFiles = prev.map(file => {
      if (!file || !file.url) return file;
      if (file.url !== fileUrl) return file;

      return {
        ...file,
        status,
        stage: stage || "processing",
        convertedPes: pesUrl || file.convertedPes || "",
        updatedAt: Date.now(),
      };
    });

    return updatedFiles.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  });

  setCurrentPage(1); // <== This line resets pagination to page 1 after any update
};

  const handleDownload = async (fileUrl, format) => {
    try {
      await fetch("/api/log-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, format }),
      });
    } catch (err) {
      console.error("[Download Log Error]", err);
    }
  };

  const handlePreview = (fileUrl) => setPreviewFileUrl(fileUrl);
  const closePreview = () => setPreviewFileUrl(null);
  const handleEdit = (fileUrl) => setEditFileUrl(fileUrl);
  const closeEditor = () => setEditFileUrl(null);

  const paginatedFiles = filteredFiles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  console.log("[Render] paginatedFiles:", paginatedFiles);

  if (!isClient) return null;

  return (
    <div className="container">
      <Toaster position="top-right" />
      <h2>Welcome</h2>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      <SidebarFilters
        filters={{ status: "", type: "", query: "" }}
        onFilterChange={(results) => {
          console.log("[SidebarFilters] Filtered results:", results);
          setFilteredFiles(results.filter(r => r && r.status));
          setCurrentPage(1);
        }}
      />

      <UploadBox uploading={uploading} dropRef={dropRef} onUpload={handleUpload} />

      <div className="file-grid">
        {Array.isArray(paginatedFiles)
          ? paginatedFiles.map((file, i) => {
              if (!file || !file.url) {
                console.warn(`[Render] Skipping null/undefined file at index ${i}`, file);
                return null;
              }

              return (
                <FileCard
                  key={file.url}
                  file={file}
                  onConvert={() => handleConvert(file.url)}
                  onDownload={() => handleDownload(file.url, "pes")}
                  onPreview={() => handlePreview(file.url)}
                  onEdit={() => handleEdit(file.url)}
                />
              );
            })
          : "[Render] paginatedFiles not array!"}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalItems={filteredFiles.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <RecentActivityPanel uploadedFiles={uploadedFiles} />

      {previewFileUrl && <StitchPreviewModal fileUrl={previewFileUrl} onClose={closePreview} />}
      {editFileUrl && <StitchEditor fileUrl={editFileUrl} onClose={closeEditor} />}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });