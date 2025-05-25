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

const FLASK_BASE     = "https://embroideryfiles.duckdns.org";
const ITEMS_PER_PAGE = 6;

function ConversionStreamModal({ baseName, logs, urls, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Converting “{baseName}”</h2>
        <div className="h-40 overflow-y-auto p-2 bg-gray-100 rounded mb-4">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
            {logs.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </pre>
        </div>
        {urls.complete ? (
          <>
            <h3 className="font-medium mb-2">Downloads:</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {urls.svgUrl && (
                <a
                  href={urls.svgUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary"
                >
                  SVG
                </a>
              )}
              {urls.pesUrl && (
                <a
                  href={urls.pesUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary"
                >
                  PES
                </a>
              )}
              {urls.dstUrl && (
                <a
                  href={urls.dstUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary"
                >
                  DST
                </a>
              )}
              {urls.expUrl && (
                <a
                  href={urls.expUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary"
                >
                  EXP
                </a>
              )}
              {urls.vp3Url && (
                <a
                  href={urls.vp3Url}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary"
                >
                  VP3
                </a>
              )}
              {urls.previewPngUrl && (
                <a
                  href={urls.previewPngUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary"
                >
                  PNG Preview
                </a>
              )}
              <a
                href={`${FLASK_BASE}/download-zip/${baseName}`}
                target="_blank"
                rel="noopener"
                className="btn btn-primary"
              >
                ZIP Bundle
              </a>
            </div>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </>
        ) : (
          <button onClick={onClose} className="btn btn-danger">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Home() {
  const dropRef = useRef(null);
  const [isClient, setIsClient]       = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading]     = useState(false);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // preview + editor
  const [previewPNG, setPreviewPNG]   = useState(null);
  const [previewPES, setPreviewPES]   = useState(null);
  const [editFileUrl, setEditFileUrl] = useState(null);

  // bg removal toggles
  const [removeBg, setRemoveBg]       = useState(false);
  const [bgThreshold, setBgThreshold] = useState(250);

  // SSE state
  const [streamingFile, setStreamingFile] = useState(null);
  const [streamLogs, setStreamLogs]       = useState([]);
  const [streamUrls, setStreamUrls]       = useState({});
  const sourceRef = useRef(null);

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (!localStorage.getItem("onboardingShown")) {
      setShowOnboarding(true);
      localStorage.setItem("onboardingShown", "true");
    }
  }, []);

  // handle initial upload
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

  // filter helper
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

  // SSE‐based convert
  const handleConvertStream = (fileUrl) => {
    const baseName = fileUrl.split("/").pop().replace(/\.\w+$/, "");
    setStreamingFile(baseName);
    setStreamLogs([`Starting conversion…`]);
    setStreamUrls({});
    // build a GET‐query so EventSource works
    const q = new URLSearchParams({
      fileUrl,
      removeBg: removeBg.toString(),
      bgThreshold: bgThreshold.toString(),
    }).toString();
    const source = new EventSource(`${FLASK_BASE}/convert-stream?${q}`);
    sourceRef.current = source;

    source.addEventListener("progress", (e) => {
      const data = JSON.parse(e.data);
      setStreamLogs((logs) => [...logs, `→ ${data.log}`]);
      // capture any URL fields
      setStreamUrls((u) => ({ ...u, ...data }));
    });

    source.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data);
      setStreamLogs((logs) => [...logs, `✔ Conversion complete!`]);
      setStreamUrls((u) => ({ ...u, ...data, complete: true }));
      updateFileStatus(fileUrl, "Converted", "done", data.pesUrl);
      source.close();
    });

    source.onerror = (err) => {
      console.error("SSE error", err);
      setStreamLogs((logs) => [...logs, `✖ Conversion failed.`]);
      updateFileStatus(fileUrl, "Error", "failed");
      source.close();
    };
  };

  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isClient) return null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-screen-lg mx-auto">
        <h2 className="text-4xl font-bold mb-8">Welcome</h2>

        {showOnboarding && (
          <OnboardingModal onClose={() => setShowOnboarding(false)} />
        )}

        {/* Filters */}
        <div className="mb-6">
          <SidebarFilters
            filters={{ status: "", type: "", query: "" }}
            onFilterChange={(updates) => {
              setFilteredFiles(
                uploadedFiles.filter((f) =>
                  (!updates.status || f.status === updates.status) &&
                  (!updates.type   || f.url.endsWith(updates.type)) &&
                  (!updates.query  ||
                    f.name.toLowerCase().includes(updates.query.toLowerCase()))
                )
              );
              setCurrentPage(1);
            }}
          />
        </div>

        {/* BG removal */}
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

        {/* Upload area */}
        <UploadBox
          uploading={uploading}
          dropRef={dropRef}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* File grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedFiles.map((file) =>
            file.url ? (
              <FileCard
                key={file.url}
                file={file}
                onConvert={() => handleConvertStream(file.url)}
                onDownload={() => {}}
                onPreview={() => {
                  setPreviewPNG(
                    file.url
                      .replace("/downloads/", "/uploads/")
                      .replace(".pes", ".png")
                  );
                  setPreviewPES(file.pesUrl);
                }}
                onEdit={() => setEditFileUrl(file.url)}
              />
            ) : null
          )}
        </div>

        {/* Pagination */}
        <PaginationControls
          currentPage={currentPage}
          totalItems={filteredFiles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />

        {/* Recent Activity */}
        <RecentActivityPanel uploadedFiles={uploadedFiles} />

        {/* Preview / Editor Modals */}
        {previewPES && previewPNG && (
          <StitchPreviewModal
            pngUrl={previewPNG}
            pesUrl={previewPES}
            onReconvert={() => handleConvertStream(previewPNG)}
            onClose={() => {
              setPreviewPES(null);
              setPreviewPNG(null);
            }}
          />
        )}
        {editFileUrl && (
          <StitchEditorModal
            fileUrl={editFileUrl}
            onClose={() => setEditFileUrl(null)}
          />
        )}

        {/* Conversion SSE Modal */}
        {streamingFile && (
          <ConversionStreamModal
            baseName={streamingFile}
            logs={streamLogs}
            urls={streamUrls}
            onClose={() => {
              sourceRef.current?.close();
              setStreamingFile(null);
              setStreamLogs([]);
              setStreamUrls({});
            }}
          />
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });