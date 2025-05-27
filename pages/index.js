// pages/index.js
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Container,
  Heading,
  Flex,
  Stack,
  Checkbox,
  Input,
  Button,
} from "@chakra-ui/react";

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
    <Box
      position="fixed"
      inset="0"
      bg="blackAlpha.600"
      zIndex="50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="whiteAlpha.100"
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor="border"
        rounded="xl"
        boxShadow="glass"
        w="full"
        maxW="xl"
        p={6}
        overflow="auto"
      >
        <Heading size="xl" mb={4} color="primaryTxt">
          Converting “{baseName}”
        </Heading>

        <Box
          h="40"
          overflowY="auto"
          p={2}
          bg="whiteAlpha.200"
          rounded="md"
          mb={4}
        >
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {logs.map((l, i) => (
              <Box as="div" key={i} color="primaryTxt" fontSize="sm">
                {l}
              </Box>
            ))}
          </pre>
        </Box>

        {urls.complete ? (
          <>
            <Heading size="md" mb={2} color="primaryTxt">
              Downloads:
            </Heading>
            <Flex wrap="wrap" gap={3} mb={4}>
              {urls.svgUrl && (
                <Button
                  as="a"
                  href={urls.svgUrl}
                  target="_blank"
                  variant="accent"
                >
                  SVG
                </Button>
              )}
              {urls.pesUrl && (
                <Button
                  as="a"
                  href={urls.pesUrl}
                  target="_blank"
                  variant="accent"
                >
                  PES
                </Button>
              )}
              {urls.dstUrl && (
                <Button
                  as="a"
                  href={urls.dstUrl}
                  target="_blank"
                  variant="accent"
                >
                  DST
                </Button>
              )}
              {urls.expUrl && (
                <Button
                  as="a"
                  href={urls.expUrl}
                  target="_blank"
                  variant="accent"
                >
                  EXP
                </Button>
              )}
              {urls.vp3Url && (
                <Button
                  as="a"
                  href={urls.vp3Url}
                  target="_blank"
                  variant="accent"
                >
                  VP3
                </Button>
              )}
              {urls.previewPngUrl && (
                <Button
                  as="a"
                  href={urls.previewPngUrl}
                  target="_blank"
                  variant="accent"
                >
                  PNG Preview
                </Button>
              )}
              <Button
                as="a"
                href={`${FLASK_BASE}/download-zip/${baseName}`}
                target="_blank"
                variant="primary"
              >
                ZIP Bundle
              </Button>
            </Flex>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="danger">
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}

function Home() {
  const dropRef = useRef(null);
  const [isClient, setIsClient]             = useState(false);
  const [uploadedFiles, setUploadedFiles]   = useState([]);
  const [uploading, setUploading]           = useState(false);
  const [filteredFiles, setFilteredFiles]   = useState([]);
  const [currentPage, setCurrentPage]       = useState(1);
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

  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isClient) return null;

  return (
    <Box minH="100vh" bg="primaryBg" py={8} px={4}>
      <Container maxW="container.lg">
        <Heading size="2xl" mb={8} color="primaryTxt">
          Welcome
        </Heading>

        {showOnboarding && (
          <OnboardingModal onClose={() => setShowOnboarding(false)} />
        )}

        {/* Filters */}
        <Box mb={6}>
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
        </Box>

        {/* BG removal */}
        <Flex mb={6} align="center" gap={4}>
          <Checkbox
            isChecked={removeBg}
            onChange={(e) => setRemoveBg(e.target.checked)}
            colorScheme="accent"
          >
            Strip white background
          </Checkbox>
          <Stack direction="row" align="center" spacing={2}>
            <Box>Threshold:</Box>
            <Input
              type="number"
              w="16"
              value={bgThreshold}
              onChange={(e) => setBgThreshold(Number(e.target.value))}
            />
          </Stack>
        </Flex>

        {/* Upload area */}
        <UploadBox
          uploading={uploading}
          dropRef={dropRef}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* File grid */}
        <Flex wrap="wrap" gap={6} mb={8}>
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
        </Flex>

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
      </Container>
    </Box>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });