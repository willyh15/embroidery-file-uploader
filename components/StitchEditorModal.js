// components/StitchEditorModal.jsx
import { useState } from "react";

export default function StitchEditorModal({ fileUrl, onClose }) {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const handleIncreaseDensity = async () => {
    setLoading(true);
    setInfoMessage(""); // clear any old message
    try {
      const res = await fetch("/api/stitch-increase-density", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error increasing density");
      setInfoMessage(data.message || "Density increased!");
    } catch (err) {
      console.error(err);
      setInfoMessage("Failed to increase density.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimplifyStitches = async () => {
    setLoading(true);
    setInfoMessage("");
    try {
      const res = await fetch("/api/stitch-simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error simplifying stitches");
      setInfoMessage(data.message || "Stitches simplified!");
    } catch (err) {
      console.error(err);
      setInfoMessage("Failed to simplify stitches.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeStitches = async () => {
    setLoading(true);
    setInfoMessage("");
    try {
      const res = await fetch("/api/stitch-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error optimizing stitches");
      setInfoMessage(data.message || "Stitches optimized!");
    } catch (err) {
      console.error(err);
      setInfoMessage("Failed to optimize stitches.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>
          X
        </button>
        
        <h2>Stitch Editor</h2>
        <p>File: {fileUrl}</p>

        {loading && <p>Processing...</p>}
        {infoMessage && <p>{infoMessage}</p>}

        <div style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0" }}>
          <p>Placeholder for Stitch Visualization (SVG or Canvas)</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button onClick={handleIncreaseDensity} disabled={loading}>
            Increase Density
          </button>
          <button onClick={handleSimplifyStitches} disabled={loading}>
            Simplify Stitches
          </button>
          <button onClick={handleOptimizeStitches} disabled={loading}>
            Optimize
          </button>
        </div>

        <div style={{ marginTop: "1rem", backgroundColor: "#f8f8f8", padding: "1rem" }}>
          <h4>Tips & Info</h4>
          <p>
            This section can provide guidance or logs about your stitch editing 
            process. For example, “Density increased to X%,” etc.
          </p>
        </div>
      </div>
    </div>
  );
}