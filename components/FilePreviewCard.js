{file.status === "Converted" && <span className="badge success">DST/PES Ready</span>}
{file.convertedUrl && (
  <a href={file.convertedUrl} target="_blank" rel="noopener noreferrer">
    <Button>Download</Button>
  </a>
)}
export default function FilePreviewCard() {}