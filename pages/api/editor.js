const [collabEdits, setCollabEdits] = useState([]);
const ws = useRef(null);


const [selectedStitches, setSelectedStitches] = useState([]);
const [bulkAdjustment, setBulkAdjustment] = useState({ density: 1.0, stitchType: "satin" });

const handleSelectStitch = (index) => {
  setSelectedStitches((prev) =>
    prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
  );
};

const applyBulkAdjustments = async () => {
  await fetch("/api/bulk-adjust-stitches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, adjustments: selectedStitches.map((i) => ({ ...edits[i], ...bulkAdjustment })) }),
  });

  alert("Bulk adjustments applied!");
};

<select onChange={(e) => setBulkAdjustment({ ...bulkAdjustment, stitchType: e.target.value })}>
  <option value="satin">Satin</option>
  <option value="running">Running</option>
  <option value="fill">Fill</option>
</select>

<button onClick={applyBulkAdjustments}>Apply Bulk Adjustments</button>
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