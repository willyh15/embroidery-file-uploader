import UploadBox from "./UploadBox";

export default function UploadArea({ uploading, dropRef, onUploadSuccess }) {
  return (
    <UploadBox
      uploading={uploading}
      dropRef={dropRef}
      onUploadSuccess={onUploadSuccess}
    />
  );
}