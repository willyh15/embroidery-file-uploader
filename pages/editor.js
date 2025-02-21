import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function StitchEditor({ fileUrl, hoopSize }) {
  const [edits, setEdits] = useState([]);
  const [selectedStitches, setSelectedStitches] = useState([]);
  const [bulkStitchType, setBulkStitchType] = useState("satin");
  const [editedFile, setEditedFile] = useState(null);
  const [collabEdits, setCollabEdits] = useState([]);
  const [designPosition, setDesignPosition] = useState({ x: 0, y: 0 });

  const ws = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update" && data.fileUrl === fileUrl) {
        setEdits(data.edits);
      } else if (data.type === "collaborate" && data.fileUrl === fileUrl) {
        setCollabEdits(data.edits);
      }
    };

    return () => ws.current.close();
  }, [fileUrl]);

  // Handle individual stitch edits
  const handleEdit = (x, y, stitchType) => {
    const newEdits = [...edits, { x, y, stitchType }];
    setEdits(newEdits);
    ws.current.send(JSON.stringify({ type: "edit", fileUrl, edits: newEdits }));
  };

  // Save edits to the backend
  const saveEdits = async () => {
    try {
      const response = await fetch("/api/edit-stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, edits }),
      });

      const data = await response.json();
      setEditedFile(data.editedFile);
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  // Handle stitch selection for bulk editing
  const handleSelectStitch = (index) => {
    setSelectedStitches((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Apply bulk stitch edits
  const applyBulkEdit = async () => {
    try {
      await fetch("/api/bulk-edit-stitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl,
          edits: selectedStitches.map((i) => ({ ...edits[i], stitchType: bulkStitchType })),
        }),
      });

      alert("Bulk edit applied!");
    } catch (error) {
      console.error("Error applying bulk edit:", error);
    }
  };

  // Handle collaborative stitch edits
  const handleCollabEdit = (x, y, stitchType) => {
    const newEdits = [...collabEdits, { x, y, stitchType }];
    setCollabEdits(newEdits);
    ws.current.send(JSON.stringify({ type: "collaborate", fileUrl, edits: newEdits }));
  };

  // Handle design dragging inside the hoop
  const handleDrag = (event) => {
    setDesignPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Stitch Editor</h2>

      {/* Save and download edited file */}
      <button onClick={saveEdits}>Save Edits</button>
      {editedFile && <a href={editedFile} download>Download Edited File</a>}

      {/* Add individual stitch */}
      <button onClick={() => handleEdit(50, 50, "satin")}>Add Stitch</button>

      {/* List of edits */}
      <ul>
        {edits.map((edit, index) => (
          <li key={index} onClick={() => handleSelectStitch(index)} style={{ cursor: "pointer", background: selectedStitches.includes(index) ? "lightgray" : "white" }}>
            Stitch at ({edit.x}, {edit.y}) - {edit.stitchType}
          </li>
        ))}
      </ul>

      {/* Bulk Editing Controls */}
      <select onChange={(e) => setBulkStitchType(e.target.value)}>
        <option value="satin">Satin</option>
        <option value="running">Running</option>
        <option value="fill">Fill</option>
      </select>
      <button onClick={applyBulkEdit}>Apply Bulk Edit</button>

      {/* Collaborative Editing */}
      <h3>Collaborative Stitch Editing</h3>
      <button onClick={() => handleCollabEdit(50, 50, "satin")}>Add Collaborative Stitch</button>
      <ul>
        {collabEdits.map((edit, index) => (
          <li key={index}>Stitch at ({edit.x}, {edit.y}) - {edit.stitchType}</li>
        ))}
      </ul>

      {/* Hoop Design Positioning & Dragging */}
      <h3>Design Preview</h3>
      <TransformWrapper>
        <TransformComponent>
          <div
            style={{
              width: `${hoopSize?.width}px`,
              height: `${hoopSize?.height}px`,
              background: "white",
              border: "2px solid black",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={fileUrl}
              alt="Embroidery Design"
              draggable="true"
              onDragEnd={handleDrag}
              style={{
                position: "absolute",
                left: `${designPosition.x}px`,
                top: `${designPosition.y}px`,
                cursor: "grab",
              }}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}