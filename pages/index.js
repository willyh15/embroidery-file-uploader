// pages/index.js
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { uploadFilesWithProgress } from "../lib/uploadWithProgress";

import SVGPreviewModal from "../components/SVGPreviewModal"; // NEW import for vector preview modal
import FileFilters from "../components/FileFilters";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import AutoStitchToggle from "../components/AutoStitchToggle";
import UploadSection from "../components/UploadSection";
import HoopSelector from "../components/HoopSelector";
import ConvertAllButton from "../components/ConvertAllButton";
import FilePreviewCard from "../components/FilePreviewCard";
import StitchPreviewModal from "../components/StitchPreviewModal";
import StitchEditorModal from "../components/StitchEditorModal";
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
  const [editorFileUrl, setEditorFileUrl] = useState(null);
  const [autoStitchEnabled, setAutoStitchEnabled] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [jumpPage, setJumpPage] = useState("");

  // NEW: State for vector preview (SVG)
  const [vectorPreviewData, setVectorPreviewData] = useState(null);

  useEffect(() => setIsClient(true), []);

  // Fetch Hoop Sizes
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

  // If not logged in, redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Show success if "setupComplete" query param
  useEffect(() => {
    if (router.query.setupComplete === "true") {
      toast.success("Role setup complete! You're ready to upload.");
      const url = new URL(window.location);
      url.searchParams.delete("setupComplete");
      window.history.replaceState({}, "", url.toString());
    }
  }, [router.query]);

  // Load recent activity from localStorage
  useEffect(() => {
    const activity = localStorage.getItem("recentActivity");
    if (activity) setRecentActivity(JSON.parse(activity));
  }, []);

  // Poll progress every 2s if we have files
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
      prev.map((file) => (file.url === fileUrl ? { ...file, progress } : file))
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

  // NEW: Handler for vector preview
  const handleVectorPreview = async (fileUrl) => {
    try {
      console.log("Requesting vector preview for:", fileUrl);
      const res = await fetch("/api/vector-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || "Vector preview failed (no detail)";
        console.error("Vector preview error:", msg, "HTTP status:", res.status);
        throw new Error(msg);
      }
      if (!data.vectorSvgUrl && !data.vectorSvgData) {
        throw new Error("Vector preview returned no data");
      }
      // Set the preview data (it could be a URL or raw SVG string)
      setVectorPreviewData(data.vectorSvgUrl || data.vectorSvgData);
      toast.success("Vector preview loaded!");
    } catch (err) {
      console.error("Error during vector preview:", err);
      toast.error("Vector preview failed");
    }
  };

  // Filtering & pagination
  const filteredFiles = uploadedFiles.filter((file) => {
    const matchesSearch = file.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? file.status === statusFilter : true;
    const matchesType = typeFilter ? file.name?.toLowerCase().endsWith(typeFilter) : true;
    return matchesSearch && matchesStatus && matchesType;
  });
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const indexOfLastFile = currentPage * itemsPerPage;
  const indexOfFirstFile = indexOfLastFile - itemsPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  const handleJumpToPage = () => {
    const num = parseInt(jumpPage);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    }
  };

  // UPLOAD
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

        // If autoStitch is on, do it automatically
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

  // AUTO-STITCH
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

  // CONVERT
  const handleConvert = async (fileUrl) => {
    try {
      console.log("Starting conversion for:", fileUrl); // debug
      const res = await fetch("/api/convert-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("Failed to parse JSON from /api/convert-file:", parseErr);
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok) {
        const msg = data?.error ? `Server error: ${data.error}` : "Conversion failed (no detail)";
        console.error("Conversion request failed:", msg, "HTTP status:", res.status);
        throw new Error(msg);
      }
      if (!data.convertedDst && !data.convertedPes) {
        console.error("No .dst or .pes from server:", data);
        throw new Error("Conversion returned no .dst or .pes files");
      }
      updateFileStatus(fileUrl, "Converted");
      toast.success("File converted!");
      console.log("Conversion success for:", fileUrl, "Response data:", data);
    } catch (err) {
      console.error("Conversion error detail:", err);
      toast.error("Conversion failed");
      updateFileStatus(fileUrl, "Error");
    }
  };

  // PREVIEW
  const handlePreview = (fileUrl) => {
    setPreviewFileUrl(fileUrl);
  };

  // RETRY
  const handleRetry = async (fileUrl) => {
    const file = uploadedFiles.find((f) => f.url === fileUrl);
    if (!file) return;
    if (file.status === "Error" && file.stage === "converting") {
      await handleConvert(fileUrl);
    } else {
      await handleAutoStitch(fileUrl);
    }
  };

  // EDIT
  const handleEdit = (fileUrl) => {
    setEditorFileUrl(fileUrl);
  };

  if (!isClient || status === "loading") return <Loader />;
  if (!session) return null;

  return (
    <div>
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} toggle={setSidebarOpen} />
      <div className="main-content container fadeIn">
        <WelcomeCard user={session.user} onLogout={signOut} />
        <UploadSection
          onUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
          setHovering={setHovering}
        />
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
        <div style={{ margin: "1rem 0" }}>
          <label>Items per page: </label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
          >
            {[6, 10, 15, 20].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        {currentFiles.length > 0 && (
          <>
            <ConvertAllButton
              onConvertAll={() => {
                currentFiles.forEach((file) => handleConvert(file.url));
              }}
            />
            {currentFiles.map((file) => (
              <FilePreviewCard
                key={file.url}
                file={file}
                onConvert={() => handleConvert(file.url)}
                onPreview={() => handlePreview(file.url)}
                onAutoStitch={() => handleAutoStitch(file.url)}
                onRetry={() => handleRetry(file.url)}
                onEdit={() => handleEdit(file.url)}
                onVectorPreview={() => handleVectorPreview(file.url)} // NEW: vector preview handler
              />
            ))}
            <div
              className="pagination-controls"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <input
                type="number"
                placeholder="Jump to page"
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                style={{ width: "100px" }}
              />
              <button onClick={handleJumpToPage}>Go</button>
            </div>
          </>
        )}
        {editorFileUrl && (
          <StitchEditorModal
            fileUrl={editorFileUrl}
            onClose={() => setEditorFileUrl(null)}
          />
        )}
        {previewFileUrl && (
          <StitchPreviewModal
            fileUrl={previewFileUrl}
            onClose={() => setPreviewFileUrl(null)}
          />
        )}
        {/* NEW: Render the SVG preview modal if vector preview data exists */}
        {vectorPreviewData && (
          <SVGPreviewModal
            svgData={vectorPreviewData}
            onClose={() => setVectorPreviewData(null)}
          />
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });