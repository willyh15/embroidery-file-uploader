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

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!localStorage.getItem("onboardingShown")) {
      setShowOnboarding(true);
      localStorage.setItem("onboardingShown", "true");
    }
  }, []);

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const localFiles = files.map(file => ({
      name: file.name,
      url: "",
      status: "Uploading",
      stage: "uploading",
      uploadProgress: 0,
      isLocal: true,
      timestamp: Date.now(),
      realFile: file
    }));

    setUploadedFiles(prev => [...localFiles, ...prev]);
    setFilteredFiles(prev => [...localFiles, ...prev]);
    setCurrentPage(1);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${FLASK_BASE}/upload`, true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadedFiles(prev => prev.map(f => f.isLocal ? { ...f, uploadProgress: progress } : f));
        }
      };

      xhr.onload = () => {
        if (xhr.status !== 200) {
          toast.error("Upload failed");
          return;
        }

        const data = JSON.parse(xhr.responseText);
        const newFiles = data.urls.map(file => ({
          ...file,
          status: "Uploaded",
          stage: "",
          timestamp: Date.now()
        }));

        setUploadedFiles(prev => [...newFiles, ...prev.filter(f => !f.isLocal)]);
        setFilteredFiles(prev => [...newFiles, ...prev.filter(f => !f.isLocal)]);

        toast.success("Upload complete!");
      };

      xhr.onerror = () => {
        toast.error("Upload error");
        setUploadedFiles(prev => prev.map(f => f.isLocal ? { ...f, status: "Error" } : f));
      };

      xhr.send(formData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
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
      toast.error(err.message);
      updateFileStatus(fileUrl, "Error", "failed");
    }
  };

  const pollConversionStatus = (taskId, fileUrl) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${FLASK_BASE}/status/${taskId}`);
        const data = await res.json();
        if (!res.ok) throw new Error("Polling failed");

        if (data.state === "SUCCESS") {
          updateFileStatus(fileUrl, "Converted", "done", data.pesUrl);
          toast.success("Conversion complete!");
          clearInterval(interval);
        } else if (data.state === "FAILURE") {
          updateFileStatus(fileUrl, "Error", "conversion-error");
          toast.error("Conversion failed");
          clearInterval(interval);
        } else {
          updateFileStatus(fileUrl, "Converting", data.stage || "processing");
        }
      } catch (err) {
        toast.error("Polling error");
        updateFileStatus(fileUrl, "Error", "poll-failed");
        clearInterval(interval);
      }
    }, 3000);
  };

  const updateFileStatus = (fileUrl, status, stage = "", pesUrl = "") => {
    setUploadedFiles(prev => prev.map(file => file.url === fileUrl
      ? { ...file, status, stage, ...(pesUrl && { pesUrl }) }
      : file
    ));
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
      <UploadBox uploading={uploading} dropRef={dropRef} onUpload={handleUpload} />
      <div className="file-grid">
        {paginatedFiles.map(file => (
          file?.url && (
            <FileCard
              key={file.url}
              file={file}
              onConvert={() => handleConvert(file.url)}
              onDownload={() => handleDownload(file.url, "pes")}
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