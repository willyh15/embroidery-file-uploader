import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
const [selectedStitches, setSelectedStitches] = useState([]);
const [bulkStitchType, setBulkStitchType] = useState("satin");
const [edits, setEdits] = useState([]);
const ws = useRef(null);

const [edits, setEdits] = useState([]);
const [editedFile, setEditedFile] = useState(null);

const handleEdit = (x, y, stitchType) => {
  setEdits([...edits, { x, y, stitchType }]);
};

const saveEdits = async (fileUrl) => {
  const response = await fetch("/api/edit-stitch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, edits }),
  });

  const data = await response.json();
  setEditedFile(data.editedFile);
};

<button onClick={() => saveEdits(fileUrl)}>Save Edits</button>

{editedFile && <a href={editedFile} download>Download Edited File</a>}

useEffect(() => {
  ws.current = new WebSocket("ws://localhost:8080");

  ws.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "update" && data.fileUrl === fileUrl) {
      setEdits(data.edits);
    }
  };

  return () => ws.current.close();
}, [fileUrl]);

const handleEdit = (x, y, stitchType) => {
  const newEdits = [...edits, { x, y, stitchType }];
  setEdits(newEdits);
  
  ws.current.send(JSON.stringify({ type: "edit", fileUrl, edits: newEdits }));
};

<button onClick={() => handleEdit(50, 50, "satin")}>Add Stitch</button>

<ul>
  {edits.map((edit, index) => (
    <li key={index}>Stitch at ({edit.x}, {edit.y}) - {edit.stitchType}</li>
  ))}
</ul>
const handleSelectStitch = (index) => {
  setSelectedStitches((prev) =>
    prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
  );
};

const applyBulkEdit = async () => {
  const response = await fetch("/api/bulk-edit-stitches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, edits: selectedStitches.map((i) => ({ ...edits[i], stitchType: bulkStitchType })) }),
  });

  alert("Bulk edit applied!");
};

<ul>
  {edits.map((edit, index) => (
    <li key={index} onClick={() => handleSelectStitch(index)} style={{ cursor: "pointer", background: selectedStitches.includes(index) ? "lightgray" : "white" }}>
      Stitch at ({edit.x}, {edit.y}) - {edit.stitchType}
    </li>
  ))}
</ul>

<select onChange={(e) => setBulkStitchType(e.target.value)}>
  <option value="satin">Satin</option>
  <option value="running">Running</option>
  <option value="fill">Fill</option>
</select>

<button onClick={applyBulkEdit}>Apply Bulk Edit</button>
const [collabEdits, setCollabEdits] = useState([]);
const ws = useRef(null);



useEffect(() => {
  ws.current = new WebSocket("ws://localhost:8080");

  ws.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "update" && data.fileUrl === fileUrl) {
      setCollabEdits(data.edits);
    }
  };

  return () => ws.current.close();
}, [fileUrl]);

const handleCollabEdit = (x, y, stitchType) => {
  const newEdits = [...collabEdits, { x, y, stitchType }];
  setCollabEdits(newEdits);

  ws.current.send(JSON.stringify({ type: "collaborate", fileUrl, edits: newEdits }));
};

<button onClick={() => handleCollabEdit(50, 50, "satin")}>Add Collaborative Stitch</button>

<ul>
  {collabEdits.map((edit, index) => (
    <li key={index}>Stitch at ({edit.x}, {edit.y}) - {edit.stitchType}</li>
  ))}
</ul>
const [designPosition, setDesignPosition] = useState({ x: 0, y: 0 });

const handleDrag = (event) => {
  setDesignPosition({ x: event.clientX, y: event.clientY });
};

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