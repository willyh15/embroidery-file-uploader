import { useEffect, useState } from "react";
import Modal from "./Modal";
import Loader from "./Loader";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState({ dstUrl: null, pesUrl: null });

  useEffect(() => {
    if (!fileUrl) return;

    const fetchPreviewUrls = async () => {
      try {
        const res = await fetch(`/api/preview?fileUrl=${encodeURIComponent(fileUrl)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch preview");
        setPreview({
          dstUrl: data.dstUrl || null,
          pesUrl: data.pesUrl || null,
        });
      } catch (err) {
        console.error("Preview fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewUrls();
  }, [fileUrl]);

  return (
    <Modal onClose={onClose}>
      <h2>Stitch Preview</h2>
      {loading ? (
        <Loader />
      ) : (
        <div className="preview-content">
          {preview.dstUrl && (
            <div>
              <p><strong>DST Preview:</strong></p>
              <img src={preview.dstUrl} alt="DST Preview" style={{ maxWidth: "100%" }} />
            </div>
          )}
          {preview.pesUrl && (
            <div>
              <p><strong>PES Preview:</strong></p>
              <img src={preview.pesUrl} alt="PES Preview" style={{ maxWidth: "100%" }} />
            </div>
          )}
          {!preview.dstUrl && !preview.pesUrl && (
            <p>No previews available yet. Try again later.</p>
          )}
        </div>
      )}
    </Modal>
  );
}