import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import FileCard from "../components/FileCard";
import UploadBox from "../components/UploadBox";
import SidebarFilters from "../components/SidebarFilters";
import PaginationControls from "../components/PaginationControls";
import OnboardingModal from "../components/OnboardingModal";
import RecentActivityPanel from "../components/RecentActivityPanel";
import StitchPreviewModal from "../components/StitchPreviewModal";

const FLASK_BASE = process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org";
const ITEMS_PER_PAGE = 6;

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropRef = useRef(null);

  const [isClient, setIsClient] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status]);

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
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newFiles = data.urls.map(file => ({
        ...file,
        status: "Uploaded",
        pesUrl: "",
        taskId: "",
        stage: "",
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success("Upload complete");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleConvert = async (fileUrl) => {
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
      toast.error(err.message);
      updateFileStatus(fileUrl, "Error", "failed");
    }
  };

  const pollConversionStatus = (taskId, fileUrl) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${FLASK_BASE}/status/${taskId}`);
        const statusData = await res.json();

        if (statusData.state === "done") {
          updateFileStatus(fileUrl, "Converted", "done", statusData.pesUrl);
          clearInterval(interval);
          toast.success("Conversion complete");
        } else if (statusData.state === "error") {
          updateFileStatus(fileUrl, "Error", "failed");
          clearInterval(interval);
          toast.error("Conversion failed");
        } else {
          updateFileStatus(fileUrl, "Converting", statusData.state);
        }
      } catch (err) {
        console.error("Polling error:", err);
        toast.error("Polling error");
        clearInterval(interval);
      }
    }, 3000);
  };

  const updateFileStatus = (fileUrl, status, stage = "", pesUrl = "") => {
    setUploadedFiles(prev =>
      prev.map(f => f.url === fileUrl ? { ...f, status, stage, convertedPes: pesUrl } : f)
    );
  };

  const handleDownload = async (fileUrl, format) => {
    try {
      await fetch("/api/log-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, format }),
      });
    } catch (err) {
      console.error("Download logging error:", err);
    }
  };

  const handlePreview = (fileUrl) => {
    setPreviewFileUrl(fileUrl);
  };

  const closePreview = () => {
    setPreviewFileUrl(null);
  };

  const paginatedFiles = filteredFiles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (!isClient || status === "loading") return null;
  if (!session) return null;

  return (
    <div className="container">
      <Toaster position="top-right" />
      <h2>Welcome, {session.user.name}</h2>
      <button onClick={() => signOut()}>Sign out</button>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      <SidebarFilters
        allFiles={uploadedFiles}
        onFilterChange={(results) => {
          setFilteredFiles(results);
          setCurrentPage(1);
        }}
      />

      <UploadBox uploading={uploading} dropRef={dropRef} onUpload={handleUpload} />

      {paginatedFiles.map(file => (
        <FileCard
          key={file.url}
          file={file}
          onConvert={() => handleConvert(file.url)}
          onDownload={() => handleDownload(file.url, "pes")}
          onPreview={() => handlePreview(file.url)}
        />
      ))}

      <PaginationControls
        currentPage={currentPage}
        totalItems={filteredFiles.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <RecentActivityPanel uploadedFiles={uploadedFiles} />

      {previewFileUrl && (
        <StitchPreviewModal fileUrl={previewFileUrl} onClose={closePreview} />
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
