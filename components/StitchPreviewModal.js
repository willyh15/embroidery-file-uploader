// /components/StitchPreviewModal.js
import { useEffect, useState, useCallback } from "react";
import Modal from "./Modal";
import Loader from "./Loader";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [loading, setLoading] = useState(true);
  const [dstPreviewUrl, setDstPreviewUrl] = useState(null);
  const [pesPreviewUrl, setPesPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  // Optional: parse a human-friendly file name from the URL
  const fileName = fileUrl?.split("/").pop() || "unknown";

  const fetchPreviews = useCallback(async () => {
    if (!fileUrl) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load previews");

      setDstPreviewUrl(data.dstUrl);
      setPesPreviewUrl(data.pesUrl);
    } catch (err) {
      console.error("Preview fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fileUrl]);

  useEffect(() => {
    fetchPreviews();
  }, [fetchPreviews]);

  // Optional: If both DST and PES are available, let user download them all.
  const handleDownloadAll = () => {
    if (dstPreviewUrl) {
      window.open(dstPreviewUrl, "_blank");
    }
    if (pesPreviewUrl) {
      window.open(pesPreviewUrl, "_blank");
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Stitch Preview</h2>
      <p style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>
        <strong>File:</strong> {fileName}
      </p>

      {loading && <Loader />}

      {!loading && error && (
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ color: "red" }}>Error: {error}</p>
          <button onClick={fetchPreviews}>Retry Fetch</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1rem" }}>
          {/* DST Preview */}
          {dstPreviewUrl && (
            <div>
              <h4>.DST Preview</h4>
              <img
                src={dstPreviewUrl}
                alt=".dst preview"
                style={{ maxWidth: "300px", display: "block", marginBottom: "0.5rem" }}
              />
              <a
                href={dstPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{ marginRight: "0.75rem" }}
              >
                Download .DST
              </a>
            </div>
          )}

          {/* PES Preview */}
          {pesPreviewUrl && (
            <div>
              <h4>.PES Preview</h4>
              <img
                src={pesPreviewUrl}
                alt=".pes preview"
                style={{ maxWidth: "300px", display: "block", marginBottom: "0.5rem" }}
              />
              <a
                href={pesPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{ marginRight: "0.75rem" }}
              >
                Download .PES
              </a>
            </div>
          )}

          {/* If neither DST nor PES was fetched successfully */}
          {!dstPreviewUrl && !pesPreviewUrl && (
            <p style={{ fontStyle: "italic" }}>No previews available.</p>
          )}
        </div>
      )}

      {/* “Download All” button if both exist */}
      {!loading && !error && dstPreviewUrl && pesPreviewUrl && (
        <div style={{ marginTop: "1.5rem" }}>
          <button onClick={handleDownloadAll}>Download All</button>
        </div>
      )}
    </Modal>
  );
}