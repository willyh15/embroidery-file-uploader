import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Box, Container, Heading } from "@chakra-ui/react";

import FiltersSection from "../components/FiltersSection";
import BackgroundRemovalControl from "../components/BackgroundRemovalControl";
import UploadArea from "../components/UploadArea";
import FileGrid from "../components/FileGrid";
import PaginationSection from "../components/PaginationSection";
import RecentActivitySection from "../components/RecentActivitySection";
import PreviewModals from "../components/PreviewModals";
import ConversionStreamModalWrapper from "../components/ConversionStreamModalWrapper";
import OnboardingModal from "../components/OnboardingModal";
import Background from "../components/Background"; // Import your new Background component

const FLASK_BASE = "https://embroideryfiles.duckdns.org";
const ITEMS_PER_PAGE = 6;

function Home() {
  const dropRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Master states
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // BG removal toggles
  const [removeBg, setRemoveBg] = useState(false);
  const [bgThreshold, setBgThreshold] = useState(250);

  // Preview + editor modals
  const [previewPNG, setPreviewPNG] = useState(null);
  const [previewPES, setPreviewPES] = useState(null);
  const [editFileUrl, setEditFileUrl] = useState(null);

  // SSE streaming conversion modal state
  const [streamingFile, setStreamingFile] = useState(null);
  const [streamLogs, setStreamLogs] = useState([]);
  const [streamUrls, setStreamUrls] = useState({});
  const sourceRef = useRef(null);

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (!localStorage.getItem("onboardingShown")) {
      setShowOnboarding(true);
      localStorage.setItem("onboardingShown", "true");
    }
  }, []);

  // Handle successful uploads
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

  // Helper to update file status and stage (used in conversion)
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

  // SSE-based conversion streaming
  const handleConvertStream = (fileUrl) => {
    const baseName = fileUrl.split("/").pop().replace(/\.\w+$/, "");
    setStreamingFile(baseName);
    setStreamLogs([`Starting conversion…`]);
    setStreamUrls({});
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

  // Filter handler passed to FiltersSection
  const handleFilterChange = (updates) => {
    setFilteredFiles(
      uploadedFiles.filter((f) =>
        (!updates.status || f.status === updates.status) &&
        (!updates.type || f.url.endsWith(updates.type)) &&
        (!updates.query || f.name.toLowerCase().includes(updates.query.toLowerCase()))
      )
    );
    setCurrentPage(1);
  };

  if (!isClient) return null;

  // Files to display on current page
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Box minH="100vh" position="relative" overflow="hidden">
      {/* Background component placed behind all content */}
      <Background />

      <Container
        maxW="container.lg"
        position="relative"
        zIndex={1}
        py={8}
        px={4}
      >
        <Heading size="2xl" mb={8} color="primaryTxt" fontWeight="bold">
          Welcome
        </Heading>

        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

        <FiltersSection filters={{ status: "", type: "", query: "" }} onFilterChange={handleFilterChange} />

        <BackgroundRemovalControl
          removeBg={removeBg}
          setRemoveBg={setRemoveBg}
          bgThreshold={bgThreshold}
          setBgThreshold={setBgThreshold}
        />

        <UploadArea uploading={uploading} dropRef={dropRef} onUploadSuccess={handleUploadSuccess} />

        <FileGrid
          files={paginatedFiles}
          onConvert={handleConvertStream}
          onPreview={(file) => {
            setPreviewPNG(file.url.replace("/downloads/", "/uploads/").replace(".pes", ".png"));
            setPreviewPES(file.pesUrl);
          }}
          onEdit={(file) => setEditFileUrl(file.url)}
        />

        <PaginationSection
          currentPage={currentPage}
          totalItems={filteredFiles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />

        <RecentActivitySection uploadedFiles={uploadedFiles} />

        <PreviewModals
          previewPNG={previewPNG}
          previewPES={previewPES}
          editFileUrl={editFileUrl}
          onClosePreview={() => {
            setPreviewPNG(null);
            setPreviewPES(null);
          }}
          onCloseEditor={() => setEditFileUrl(null)}
          onReconvert={(pngUrl) => handleConvertStream(pngUrl)}
        />

        <ConversionStreamModalWrapper
          streamingFile={streamingFile}
          streamLogs={streamLogs}
          streamUrls={streamUrls}
          onClose={() => {
            sourceRef.current?.close();
            setStreamingFile(null);
            setStreamLogs([]);
            setStreamUrls({});
          }}
        />
      </Container>
    </Box>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });