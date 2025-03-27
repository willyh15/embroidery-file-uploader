// /components/StitchPreviewModal.js
import { useEffect, useState } from "react";
import Modal from "./Modal";
import Loader from "./Loader";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [loading, setLoading] = useState(true);
  const [dstPreviewUrl, setDstPreviewUrl] = useState(null);
  const [pesPreviewUrl, setPesPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileUrl) return;

    const fetchPreviews = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load previews");

        setDstPreviewUrl(data.dstUrl);
        setPesPreviewUrl(data.pesUrl);
        setLoading(false);
      } catch (err) {
        console.error("Preview fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPreviews();
  }, [fileUrl]);

  return (
    <Modal onClose={onClose}>
      <h2>Stitch Preview</h2>

      {loading && <Loader />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1rem" }}>
          {dstPreviewUrl && (
            <div>
              <h4>.DST Preview</h4>
              <img src={dstPreviewUrl} alt=".dst preview" style={{ maxWidth: "300px" }} />
              <a href={dstPreviewUrl} target="_blank" rel="noopener noreferrer" download>
                Download .DST
              </a>
            </div>
          )}

          {pesPreviewUrl && (
            <div>
              <h4>.PES Preview</h4>
              <img src={pesPreviewUrl} alt=".pes preview" style={{ maxWidth: "300px" }} />
              <a href={pesPreviewUrl} target="_blank" rel="noopener noreferrer" download>
                Download .PES
              </a>
            </div>
          )}

          {!dstPreviewUrl && !pesPreviewUrl && <p>No previews available.</p>}
        </div>
      )}
    </Modal>
  );
}