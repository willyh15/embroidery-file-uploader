import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { uploadFilesWithProgress } from "../lib/uploadWithProgress";

import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import UploadSection from "../components/UploadSection";
import FilePreviewCard from "../components/FilePreviewCard";
import ConvertAllButton from "../components/ConvertAllButton";
import SVGPreviewModal from "../components/SVGPreviewModal";
import StitchPreviewModal from "../components/StitchPreviewModal";
import StitchEditorModal from "../components/StitchEditorModal";

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropRef = useRef(null);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [editorFileUrl, setEditorFileUrl] = useState(null);
  const [vectorPreviewData, setVectorPreviewData] = useState(null);
  const [autoStitchEnabled, setAutoStitchEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    uploadFilesWithProgress({
      files,
      onProgress: (p) => setUploadProgress(p),
      onComplete: (uploaded) => {
        const entries = uploaded.map((f) => ({
          url: f.url,
          name: f.name,
          status: "Uploaded",
          progress: 100,
        }));
        setUploadedFiles((prev) => [...prev, ...entries]);
        toast.success("Upload complete");
        if (autoStitchEnabled) entries.forEach((f) => handleAutoStitch(f.url));
        setUploading(false);
      },
      onError: () => {
        toast.error("Upload failed");
        setUploading(false);
      },
    });
  };

  const handleConvert = async (fileUrl) => {
    try {
      const res = await fetch("/api/convert-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const result = await res.json();
      if (!res.ok || !result.convertedPes) throw new Error(result.error);
      updateFile(fileUrl, { status: "Converted", convertedPes: result.convertedPes });
      toast.success("Converted!");
    } catch (err) {
      toast.error("Convert error");
      updateFile(fileUrl, { status: "Error" });
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
      toast.success("Auto-stitched!");
      updateFile(fileUrl, { status: "Auto-stitched" });
    } catch {
      toast.error("Auto-stitch error");
      updateFile(fileUrl, { status: "Error" });
    }
  };

  const updateFile = (fileUrl, patch) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.url === fileUrl ? { ...f, ...patch } : f))
    );
  };

  const handleRetry = async (fileUrl) => {
    const file = uploadedFiles.find((f) => f.url === fileUrl);
    if (!file) return;
    file.status === "Error" ? handleConvert(fileUrl) : handleAutoStitch(fileUrl);
  };

  if (!isClient || status === "loading") return <Loader />;
  if (!session) return null;

  return (
    <div>
      <Toaster position="top-right" />
      <Sidebar isOpen={true} toggle={() => {}} />
      <div className="main-content container">
        <h2>Welcome, {session.user?.name}</h2>
        <UploadSection
          onUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />

        {uploadedFiles.length > 0 && (
          <>
            <ConvertAllButton onConvertAll={() =>
              uploadedFiles.forEach((f) => handleConvert(f.url))
            } />
            {uploadedFiles.map((file) => (
              <FilePreviewCard
                key={file.url}
                file={file}
                onConvert={() => handleConvert(file.url)}
                onAutoStitch={() => handleAutoStitch(file.url)}
                onRetry={() => handleRetry(file.url)}
                onPreview={() => setPreviewFileUrl(file.url)}
                onEdit={() => setEditorFileUrl(file.url)}
                onVectorPreview={() => {
                  fetch("/api/vector-preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fileUrl: file.url }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (!data.vectorSvgData) throw new Error();
                      setVectorPreviewData(data.vectorSvgData);
                    })
                    .catch(() => toast.error("Vector preview failed"));
                }}
              />
            ))}
          </>
        )}

        {previewFileUrl && (
          <StitchPreviewModal fileUrl={previewFileUrl} onClose={() => setPreviewFileUrl(null)} />
        )}
        {editorFileUrl && (
          <StitchEditorModal fileUrl={editorFileUrl} onClose={() => setEditorFileUrl(null)} />
        )}
        {vectorPreviewData && (
          <SVGPreviewModal svgData={vectorPreviewData} onClose={() => setVectorPreviewData(null)} />
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });