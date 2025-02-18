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