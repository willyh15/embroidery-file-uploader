import ConvertAllButton from "./ConvertAllButton";
import FilePreviewCard from "./FilePreviewCard";

export default function UploaderDashboard({
  uploadedFiles,
  onConvert,
  onPreview,
  onAutoStitch,
  onRetry,
}) {
  if (!uploadedFiles || uploadedFiles.length === 0) return null;

  return (
    <>
      <ConvertAllButton onConvertAll={() =>
        uploadedFiles.forEach((file) => onConvert(file.url))
      } />
      {uploadedFiles.map((file) => (
        <FilePreviewCard
          key={file.url}
          file={file}
          onConvert={() => onConvert(file.url)}
          onPreview={() => onPreview(file.url)}
          onAutoStitch={() => onAutoStitch(file.url)}
          onRetry={() => onRetry(file.url)}
        />
      ))}
    </>
  );
}