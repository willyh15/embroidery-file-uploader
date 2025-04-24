import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import FileCard from "../components/FileCard";
import UploadBox from "../components/UploadBox";
import SidebarFilters from "../components/SidebarFilters";
import PaginationControls from "../components/PaginationControls";
import OnboardingModal from "../components/OnboardingModal";
import RecentActivityPanel from "../components/RecentActivityPanel";
import StitchPreviewModal from "../components/StitchPreviewModal";
import StitchEditor from "../components/StitchEditor";
import { CustomToaster } from "../components/CustomToaster"; // << Don't forget this!

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
  files.forEach((file) => {
    formData.append("files", file); // append the real file object
  });

  const localFiles = files.map(file => ({
    name: file.name,
    url: "", // no URL.createObjectURL
    status: "Uploading",
    stage: "uploading",
    uploadProgress: 0,
    isLocal: true,
    timestamp: Date.now(),
    realFile: file, // save real file object temporarily
  }));

  setUploadedFiles(prev => [...localFiles, ...prev]);
  setFilteredFiles(prev => [...localFiles, ...prev]);
  setCurrentPage(1);

  try {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${FLASK_BASE}/upload`, true); // IMPORTANT: Post directly to Flask server

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadedFiles(prev => prev.map(f => 
          f.isLocal ? { ...f, uploadProgress: progress } : f
        ));
      }
    };

    xhr.onload = async () => {
      if (xhr.status !== 200) {
        toast.error("Upload failed");
        return;
      }

      const data = JSON.parse(xhr.responseText);
      const newFiles = data.urls.map(file => ({
        ...file,
        status: "Uploaded",
        pesUrl: "",
        taskId: "",
        stage: "",
        timestamp: Date.now(),
      }));

      setUploadedFiles(prev => [
        ...newFiles,
        ...prev.filter(f => !f.isLocal)
      ]);
      setFilteredFiles(prev => [
        ...newFiles,
        ...prev.filter(f => !f.isLocal)
      ]);

      setTimeout(() => {
        const firstNewFile = document.querySelector(`[data-file-url="${newFiles[0].url}"]`);
        if (firstNewFile) {
          firstNewFile.scrollIntoView({ behavior: "smooth", block: "center" });
          firstNewFile.classList.add("animate-bounce");
          setTimeout(() => firstNewFile.classList.remove("animate-bounce"), 1000);
        }
      }, 300);

      toast.success("Upload complete!");
    };

    xhr.onerror = () => {
      toast.error("Upload error");
      setUploadedFiles(prev =>
        prev.map(f => f.isLocal ? { ...f, status: "Error", uploadProgress: undefined } : f)
      );
    };

    xhr.send(formData);

  } catch (err) {
    console.error("[Upload Error]", err);
    toast.error(err.message);
  } finally {
    setUploading(false);
  }
};

  const handleConvert = async (fileUrl) => {
  console.log(`[Convert] Starting conversion for: ${fileUrl}`);
  updateFileStatus(fileUrl, "Converting", "initiating");

  try {
    const res = await fetch(`${FLASK_BASE}/convert`, { // <-- Call Flask directly
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await res.json();
    if (!res.ok || !data.task_id) {  // <-- Flask returns `task_id`, not `taskId`
      throw new Error("Conversion failed to start");
    }

    updateFileStatus(fileUrl, "Converting", "processing");

    // Start polling with Flask task ID
    pollConversionStatus(data.task_id, fileUrl);

  } catch (err) {
    console.error("[Convert Error]", err);
    toast.error(err.message || "Conversion failed");
    updateFileStatus(fileUrl, "Error", "failed");
  }
};

  const pollConversionStatus = (taskId, fileUrl) => {
  console.log(`[Polling] Starting for Task ID: ${taskId}`);
  
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${FLASK_BASE}/status/${encodeURIComponent(taskId)}`); // <-- Use Flask /status/:taskId
      const statusData = await res.json();

      if (!res.ok || !statusData) {
        console.error("[Polling] Bad response:", res.status, statusData);
        updateFileStatus(fileUrl, "Error", "poll-failed");
        clearInterval(interval);
        return;
      }

      if (statusData.state === "SUCCESS" || statusData.status === "Conversion complete") {
        updateFileStatus(fileUrl, "Converted", "done", statusData.pesUrl);
        toast.success("Conversion complete!");
        clearInterval(interval);
      } else if (statusData.state === "FAILURE" || statusData.status?.startsWith("Error")) {
        updateFileStatus(fileUrl, "Error", "conversion-error");
        toast.error("Conversion failed");
        clearInterval(interval);
      } else {
        updateFileStatus(fileUrl, "Converting", statusData.stage || "processing");
      }

    } catch (err) {
      console.error("[Polling Error]", err);
      updateFileStatus(fileUrl, "Error", "poll-failed");
      toast.error("Polling error");
      clearInterval(interval);
    }
  }, 3000);
};

  const updateFileStatus = (fileUrl, status, stage = "", pesUrl = "") => {
  if (!fileUrl || !status) return;

  setUploadedFiles(prev => {
    const updated = prev.map(f => {
      if (!f || !f.url) return f;
      if (f.url === fileUrl) {
        return { ...f, status, stage, pesUrl }; // <- was `convertedPes` before
      }
      return f;
    });

    if (status === "Converted") {
      setTimeout(() => {
        const card = document.querySelector(`[data-file-url="${fileUrl}"]`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("ring-4", "ring-green-400");
          setTimeout(() => card.classList.remove("ring-4", "ring-green-400"), 3000);
        }
      }, 300);
    }

    return updated;
  });
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

  if (!isClient) return null;

  return (
    <div className="container">
      <CustomToaster />
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Welcome</h2>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      <SidebarFilters
        filters={{ status: "", type: "", query: "" }}
        onFilterChange={(results) => {
          setFilteredFiles(results.filter(r => r && r.status));
          setCurrentPage(1);
        }}
      />

      <UploadBox uploading={uploading} dropRef={dropRef} onUpload={handleUpload} />

      <div className="file-grid">
        {Array.isArray(paginatedFiles)
          ? paginatedFiles.map((file, i) => (
              file && file.url ? (
                <FileCard
                  key={file.url}
                  file={file}
                  onConvert={() => handleConvert(file.url)}
                  onDownload={() => handleDownload(file.url, "pes")}
                  onPreview={() => handlePreview(file.url)}
                  onEdit={() => handleEdit(file.url)}
                />
              ) : null
            ))
          : "[Render] paginatedFiles not array"}
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