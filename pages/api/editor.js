import { useState } from "react";

export default function Editor() {
  const [bulkAdjustment, setBulkAdjustment] = useState({ stitchType: "satin" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const applyBulkAdjustments = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/apply-bulk-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkAdjustment),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Bulk adjustments applied successfully!");
      } else {
        setMessage(data.error || "Error applying adjustments");
      }
    } catch (error) {
      console.error("Error applying bulk adjustments:", error);
      setMessage("Error applying adjustments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <select
        value={bulkAdjustment.stitchType}
        onChange={(e) =>
          setBulkAdjustment({ ...bulkAdjustment, stitchType: e.target.value })
        }
      >
        <option value="satin">Satin</option>
        <option value="running">Running</option>
        <option value="fill">Fill</option>
      </select>

      <button 
        onClick={applyBulkAdjustments} 
        disabled={loading} 
        style={{ marginLeft: "1rem" }}
      >
        {loading ? "Applying..." : "Apply Bulk Adjustments"}
      </button>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </>
  );
}