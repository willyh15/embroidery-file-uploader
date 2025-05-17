// pages/index.js
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
import StitchEditorModal from "../components/StitchEditorModal";

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

  // NEW: background‐removal toggles
  const [removeBg, setRemoveBg] = useState(false);
  const [bgThreshold, setBgThreshold] = useState(250);

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (!localStorage.getItem("onboardingShown")) {
      setShowOnboarding(true);
      localStorage.setItem("onboardingShown", "true");
    }
  }, []);

  const handleUploadSuccess = (newFiles) => {
    const uploaded = newFiles.map((file) => ({
      ...file,
      status: "Uploaded",
      stage: "",
      timestamp: Date.now(),
    }));
    setUploadedFiles((prev) => [...uploaded, ...prev]);
    setFilteredFiles((prev) => [...uploaded, ...prev]);
    setCurrentPage(1);
  };

  const handleConvert = async (fileUrl) => {
    toast.loading("Starting conversion…", { id: fileUrl });
    updateFileStatus(fileUrl, "Converting", "initiating");

    try {
      const res = await fetch(`${FLASK_BASE}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl,
          removeBg,       // send user’s choice
          bgThreshold     // send tuning value
        })
      });
      const data = await res.json();
      if (!res.ok || !data.task_id) {
        throw new Error(data.error || "Conversion failed to start");
      }
      updateFileStatus(fileUrl, "Converting", "processing");
      pollConversionStatus(data.task_id, fileUrl);
    } catch (err) {
      console.error(err);
      toast.error(err.message, { id: fileUrl });
      updateFileStatus(fileUrl, "Error", "failed");
    }
  };

  const pollConversionStatus = (taskId, fileUrl) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${FLASK_BASE}/status/${taskId}`);
        const data = await res.json();
        if (data.state === "SUCCESS" && data.pesUrl) {
          updateFileStatus(fileUrl, "Converted", "done", data.pesUrl);
          toast.success("Conversion complete!", { id: fileUrl });
          clearInterval(interval);
        } else if (data.state === "FAILURE" || data.status?.startsWith("Error")) {
          updateFileStatus(fileUrl, "Error", "conversion-error");
          toast.error("Conversion failed", { id: fileUrl });
          clearInterval(interval);
        } else {
          updateFileStatus(fileUrl, "Converting", data.stage || "processing");
        }
      } catch (err) {
        console.error(err);
        updateFileStatus(fileUrl, "Error", "poll-failed");
        toast.error("Polling error", { id: fileUrl });
        clearInterval(interval);
      }
    }, 3000);
  };

  const updateFileStatus = (fileUrl, status, stage = "", pesUrl = "") => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.url !== fileUrl ? f : { ...f, status, stage, ...(pesUrl && { pesUrl }) }
      )
    );
    setFilteredFiles((prev) =>
      prev.map((f) =>
        f.url !== fileUrl ? f : { ...f, status, stage, ...(pesUrl && { pesUrl }) }
      )
    );
  };

  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isClient) return null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container">
        <h2 className="text-4xl font-bold mb-8">Welcome</h2>

        {showOnboarding && (
          <OnboardingModal onClose={() => setShowOnboarding(false)} />
        )}

        <div className="mb-6">
          <SidebarFilters
            filters={{ status: "", type: "", query: "" }}
            onFilterChange={(updates) => {
              setFilteredFiles(
                uploadedFiles.filter((f) =>
                  (!updates.status || f.status === updates.status) &&
                  (!updates.type || f.url.endsWith(updates.type)) &&
                  (!updates.query ||
                    f.name.toLowerCase().includes(updates.query.toLowerCase()))
                )
              );
              setCurrentPage(1);
            }}
          />
        </div>

        {/* == NEW: Bg‐removal controls == */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={removeBg}
              onChange={() => setRemoveBg((b) => !b)}
              className="form-checkbox"
            />
            <span>Strip white background</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <span>Threshold:</span>
            <input
              type="number"
              value={bgThreshold}
              onChange={(e) => setBgThreshold(Number(e.target.value))}
              className="w-16 border rounded px-2 py-1"
            />
          </label>
        </div>

        <UploadBox
          uploading={uploading}
          dropRef={dropRef}
          onUploadSuccess={handleUploadSuccess}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedFiles.map(
            (file) =>
              file.url && (
                <FileCard
                  key={file.url}
                  file={file}
                  onConvert={() => handleConvert(file.url)}
                  onDownload={() => {}}
                  onPreview={() => setPreviewFileUrl(file.pesUrl)}
                  onEdit={() => setEditFileUrl(file.url)}
                />
              )
          )}
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalItems={filteredFiles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />

        <RecentActivityPanel uploadedFiles={uploadedFiles} />

        {previewFileUrl && (
          <StitchPreviewModal
            fileUrl={previewFileUrl}
            onClose={() => setPreviewFileUrl(null)}
          />
        )}
        {editFileUrl && (
          <StitchEditorModal
            fileUrl={editFileUrl}
            onClose={() => setEditFileUrl(null)}
          />
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });