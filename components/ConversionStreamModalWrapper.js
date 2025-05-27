import ConversionStreamModal from "../pages/index.js"; // Or create a separate file for ConversionStreamModal

export default function ConversionStreamModalWrapper({
  streamingFile,
  streamLogs,
  streamUrls,
  onClose,
}) {
  if (!streamingFile) return null;

  return (
    <ConversionStreamModal
      baseName={streamingFile}
      logs={streamLogs}
      urls={streamUrls}
      onClose={onClose}
    />
  );
}