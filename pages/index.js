import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";

import SVGPreviewModal from "../components/SVGPreviewModal";
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
  const [vectorPreviewData, setVectorPreviewData] = useState(null);
  const [autoStitchEnabled, setAutoStitchEnabled] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [jumpPage, setJumpPage] = useState("");
  const [downloadStats, setDownloadStats] = useState({});

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const fetchDownloadStats = async () => {
      const newStats = {};
      for (const file of uploadedFiles) {
        try {
          const res = await fetch(`/api/get-download-stats?fileUrl=${encodeURIComponent(file.url)}`);
          const data = await res.json();
          if (res.ok) {
            newStats[file.url] = data;
          }
        } catch (err) {
          console.error("Failed to fetch download stats:", err);
        }
      }
      setDownloadStats(newStats);
    };

    if (uploadedFiles.length > 0) {
      fetchDownloadStats();
    }
  }, [uploadedFiles]);

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
          updateFileStatus(file.url, data.status, null, data.stage, data.timestamp);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }
  };

  const updateFileStatus = (fileUrl, status, convertedUrl = null, stage = null, timestamp = null) => {
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.url === fileUrl
          ? { ...file, status, stage: stage || file.stage, convertedUrl: convertedUrl || file.convertedUrl, timestamp }
          : file
      )
    );
  };

  const updateFileProgress = (fileUrl, progress) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.url === fileUrl ? { ...file, progress } : file))
    );
  };

  const handleConvert = async (fileUrl) => {
    try {
      const res = await fetch("/api/convert-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      const text = await res.text();
      console.log("Raw conversion response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        throw new Error("Invalid JSON response from /api/convert-file");
      }

      if (!res.ok || (!result.convertedDst && !result.convertedPes)) {
        console.error("Conversion failed:", result);
        throw new Error(result.error || "Unknown error during conversion");
      }

      updateFileStatus(fileUrl, "Converted", result.convertedUrl);
      toast.success("File converted!");
    } catch (err) {
      toast.error("Conversion failed");
      console.error("Convert error:", err);
      updateFileStatus(fileUrl, "Error");
    }
  };

  const handlePreview = (fileUrl) => setPreviewFileUrl(fileUrl);

  const handleRetry = async (fileUrl) => {
    const file = uploadedFiles.find((f) => f.url === fileUrl);
    if (!file) return;
    if (file.status === "Error" && file.stage === "converting") {
      await handleConvert(fileUrl);
    } else {
      await handleAutoStitch(fileUrl);
    }
  };

  const handleEdit = (fileUrl) => setEditorFileUrl(fileUrl);

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
    } catch {
      toast.error("Auto-stitch failed");
      updateFileStatus(fileUrl, "Error");
    }
  };

  const handleVectorPreview = async (fileUrl) => {
    try {
      const res = await fetch("/api/vector-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await res.json();
      if (!res.ok || (!data.vectorSvgUrl && !data.vectorSvgData)) throw new Error("Vector preview error");
      setVectorPreviewData(data.vectorSvgUrl || data.vectorSvgData);
      toast.success("Vector preview loaded!");
    } catch (err) {
      toast.error("Vector preview failed");
    }
  };

  const handleDownload = async (fileUrl, format) => {
    try {
      await fetch("/api/log-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, format }),
      });
    } catch (err) {
      console.error("Download log failed:", err);
    }
  };

  const handleDownloadAll = async (fileUrl) => {
    await handleDownload(fileUrl, "dst");
    await handleDownload(fileUrl, "pes");
  };

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

  if (!isClient || status === "loading") return <Loader />;
  if (!session) return null;

  return (
    <div>
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} toggle={setSidebarOpen} />
      <div className="main-content container fadeIn">
        <WelcomeCard user={session.user} onLogout={signOut} />
        <UploadSection onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} setHovering={setHovering} />
        <UploaderDashboard dropRef={dropRef} hovering={hovering} setHovering={setHovering} handleUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} autoStitchEnabled={autoStitchEnabled} setAutoStitchEnabled={setAutoStitchEnabled} hoopSizes={hoopSizes} hoopSize={hoopSize} setHoopSize={setHoopSize} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <AlignmentGuide alignmentGuide={alignmentGuide} fetchGuide={async () => {
          const res = await fetch("/api/get-alignment-guide", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hoopSize }),
          });
          const data = await res.json();
          setAlignmentGuide(data.alignmentGuideUrl);
          toast.success("Hoop guide fetched!");
        }} />
        <FileFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} />
        <div style={{ margin: "1rem 0" }}>
          <label>Items per page: </label>
          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))}>
            {[6, 10, 15, 20].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        {currentFiles.length > 0 && (
          <>
            <ConvertAllButton onConvertAll={() => currentFiles.forEach((file) => handleConvert(file.url))} />
            {currentFiles.map((file) => (
              <FilePreviewCard
                key={file.url}
                file={file}
                onConvert={() => handleConvert(file.url)}
                onPreview={() => handlePreview(file.url)}
                onAutoStitch={() => handleAutoStitch(file.url)}
                onRetry={() => handleRetry(file.url)}
                onEdit={() => handleEdit(file.url)}
                onVectorPreview={() => handleVectorPreview(file.url)}
                onDownload={handleDownload}
                onDownloadAll={handleDownloadAll}
                downloadStat={downloadStats[file.url] || {}}
              />
            ))}
            <div className="pagination-controls" style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>Prev</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
              <input type="number" placeholder="Jump to page" value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} style={{ width: "100px" }} />
              <button onClick={handleJumpToPage}>Go</button>
            </div>
          </>
        )}
        {editorFileUrl && <StitchEditorModal fileUrl={editorFileUrl} onClose={() => setEditorFileUrl(null)} />}
        {previewFileUrl && <StitchPreviewModal fileUrl={previewFileUrl} onClose={() => setPreviewFileUrl(null)} />}
        {vectorPreviewData && <SVGPreviewModal svgData={vectorPreviewData} onClose={() => setVectorPreviewData(null)} />}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });