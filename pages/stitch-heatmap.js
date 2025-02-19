const [heatmapFile, setHeatmapFile] = useState(null);

const handleGenerateHeatmap = async (fileUrl) => {
  const response = await fetch("/api/stitch-heatmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });

  const data = await response.json();
  setHeatmapFile(data.heatmapFile);
};

<button onClick={() => handleGenerateHeatmap(fileUrl)}>Generate Stitch Heatmap</button>

{heatmapFile && <img src={heatmapFile} alt="Stitch Density Heatmap" />}