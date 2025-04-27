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
import { CustomToaster } from "../components/CustomToaster";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";
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

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!localStorage.getItem("onboardingShown")) {
      setShowOnboarding(true);
      localStorage.setItem("onboardingShown", "true");
    }
  }, []);

  const handleUploadSuccess = (newFiles) => {
    const uploaded = newFiles.map(file => ({
      ...file,
      status: "Uploaded",
      stage: "",
      timestamp: Date.now(),
    }));
    setUploadedFiles(prev => [...uploaded, ...prev]);
    setFilteredFiles(prev => [...uploaded, ...prev]);
    setCurrentPage(1);
  };

  const handleConvert = async (fileUrl) => {
    updateFileStatus(fileUrl, "Converting", "initiating");
    try {
      const res = await fetch(`${FLASK_BASE}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.task_id) throw new Error("Conversion failed to start");

      updateFileStatus(fileUrl, "Converting", "processing");
      pollConversionStatus(data.task_id, fileUrl);
    } catch (err) {
      console.error("[Convert Error]", err);
      toast.error(err.message);
      updateFileStatus(fileUrl, "Error", "failed");
    }
  };

  const pollConversionStatus = (taskId, fileUrl) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${FLASK_BASE}/status/${taskId}`);
        const data = await res.json();

        if (!res.ok || !data) {
          updateFileStatus(fileUrl, "Error", "poll-failed");
          clearInterval(interval);
          return;
        }

        if (data.state === "SUCCESS" && data.pesUrl) {
          updateFileStatus(fileUrl, "Converted", "done", data.pesUrl);
          toast.success("Conversion complete!");
          clearInterval(interval);
        } else if (data.state === "FAILURE" || data.status?.startsWith("Error")) {
          updateFileStatus(fileUrl, "Error", "conversion-error");
          toast.error("Conversion failed");
          clearInterval(interval);
        } else {
          updateFileStatus(fileUrl, "Converting", data.stage || "processing");
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
    setUploadedFiles(prev => prev.map(file => {
      if (file.url !== fileUrl) return file;
      const updated = { ...file, status, stage };
      if (pesUrl) updated.pesUrl = pesUrl;
      return updated;
    }));
    setFilteredFiles(prev => prev.map(file => {
      if (file.url !== fileUrl) return file;
      const updated = { ...file, status, stage };
      if (pesUrl) updated.pesUrl = pesUrl;
      return updated;
    }));
  };

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

      <UploadBox uploading={uploading} dropRef={dropRef} onUploadSuccess={handleUploadSuccess} />

      <div className="file-grid">
        {paginatedFiles.map(file => (
          file?.url && (
            <FileCard
              key={file.url}
              file={file}
              onConvert={() => handleConvert(file.url)}
              onDownload={() => {}}
              onPreview={() => setPreviewFileUrl(file.pesUrl)}
              onEdit={() => setEditFileUrl(file.url)}
            />
          )
        ))}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalItems={filteredFiles.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <RecentActivityPanel uploadedFiles={uploadedFiles} />

      {previewFileUrl && <StitchPreviewModal fileUrl={previewFileUrl} onClose={() => setPreviewFileUrl(null)} />}
      {editFileUrl && <StitchEditor fileUrl={editFileUrl} onClose={() => setEditFileUrl(null)} />}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });