import { useState, useEffect, useRef } from "react";

export default function Editor() {
  const [bulkAdjustment, setBulkAdjustment] = useState({ stitchType: "satin" });

  const applyBulkAdjustments = async () => {
    alert("Bulk adjustments applied!");
  };

  return (
    <>
      <select
        onChange={(e) =>
          setBulkAdjustment({ ...bulkAdjustment, stitchType: e.target.value })
        }
      >
        <option value="satin">Satin</option>
        <option value="running">Running</option>
        <option value="fill">Fill</option>
      </select>

      <button onClick={applyBulkAdjustments}>Apply Bulk Adjustments</button>
    </>
  );
}