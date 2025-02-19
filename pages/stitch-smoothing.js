const [smoothedFile, setSmoothedFile] = useState(null);

const handleSmoothStitch = async (fileUrl) => {
  const response = await fetch("/api/smooth-stitch-path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });

  const data = await response.json();
  setSmoothedFile(data.smoothedFile);
};

<button onClick={() => handleSmoothStitch(fileUrl)}>Smooth Stitch Path</button>

{smoothedFile && <img src={smoothedFile} alt="Smoothed Stitch Path" />}